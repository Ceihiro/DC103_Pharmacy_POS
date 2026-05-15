<?php
session_start();
require 'db.php';

$action = $_GET['action'] ?? '';

// GET TRANSACTIONS
if ($action === 'get') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([]);
        $conn->close();
        exit;
    }

    $start_date = $_GET['start_date'] ?? '';
    $end_date = $_GET['end_date'] ?? '';

    $sql = "SELECT 
                t.transaction_id,
                t.transaction_date,
                t.subtotal_amount,
                t.total_amount,
                t.cash_tendered,
                t.change_amount,
                GROUP_CONCAT(r.product_name SEPARATOR ', ') AS items
            FROM sales_transactions t
            LEFT JOIN receipts r ON t.transaction_id = r.transaction_id";

    $params = [];
    $types = '';

    if (!empty($start_date) && !empty($end_date)) {
        $sql .= " WHERE DATE(t.transaction_date) >= ? AND DATE(t.transaction_date) <= ?";
        $params[] = $start_date;
        $params[] = $end_date;
        $types .= 'ss';
    } elseif (!empty($start_date)) {
        $sql .= " WHERE DATE(t.transaction_date) >= ?";
        $params[] = $start_date;
        $types .= 's';
    } elseif (!empty($end_date)) {
        $sql .= " WHERE DATE(t.transaction_date) <= ?";
        $params[] = $end_date;
        $types .= 's';
    }

    $sql .= " GROUP BY t.transaction_id ORDER BY t.transaction_date DESC";

    $stmt = $conn->prepare($sql);
    
    if ($types) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    $transactions = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $transactions[] = $row;
        }
    }

    echo json_encode($transactions);
    $stmt->close();
    $conn->close();
    exit;
}



$data = json_decode(file_get_contents('php://input'), true);

// SAVE TRANSACTION
if ($action === 'save') {
    $cart = $data['cart'] ?? [];
    $subtotal = isset($data['subtotal']) ? floatval($data['subtotal']) : floatval($data['total']);
    $total = floatval($data['total']);
    $cash = isset($data['cash']) ? floatval($data['cash']) : $total;
    $change_amount = isset($data['change']) ? floatval($data['change']) : 0;

    if (empty($cart) || $total <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid transaction']);
        exit;
    }

    if ($cash < $total) {
        echo json_encode(['success' => false, 'message' => 'Insufficient cash tendered']);
        exit;
    }

    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("INSERT INTO sales_transactions 
                                    (transaction_date, subtotal_amount, total_amount, cash_tendered, change_amount, created_at) 
                                VALUES (NOW(), ?, ?, ?, ?, NOW())");
        $stmt->bind_param('dddd', $subtotal, $total, $cash, $change_amount);
        $stmt->execute();
        $transaction_id = $conn->insert_id;
        $stmt->close();

        $stmt2 = $conn->prepare("INSERT INTO receipts 
                                    (transaction_id, product_id, product_name, quantity, price, subtotal) 
                                VALUES (?, ?, ?, ?, ?, ?)");

        foreach ($cart as $item) {
            $pid = intval($item['product_id']);
            $pname = trim($item['product_name']);
            $qty = intval($item['quantity']);
            $price = floatval($item['price']);
            $itemSub = floatval($item['subtotal']);
            $stmt2->bind_param('iisidd', $transaction_id, $pid, $pname, $qty, $price, $itemSub);
            $stmt2->execute();
        }

        $stmt2->close();
        $conn->commit();
        echo json_encode(['success' => true, 'transaction_id' => $transaction_id]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    $conn->close();
    exit;
}

// CLEAR TRANSACTIONS
if ($action === 'clear') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $start_date = $data['start_date'] ?? '';
    $end_date = $data['end_date'] ?? '';

    if (empty($start_date) || empty($end_date)) {
        echo json_encode(['success' => false, 'message' => 'Date range is required']);
        exit;
    }

    $conn->begin_transaction();
    try {
        // Get count to return to user
        $stmtCount = $conn->prepare("SELECT COUNT(*) as cnt FROM sales_transactions WHERE DATE(transaction_date) >= ? AND DATE(transaction_date) <= ?");
        $stmtCount->bind_param('ss', $start_date, $end_date);
        $stmtCount->execute();
        $resCount = $stmtCount->get_result();
        $row = $resCount->fetch_assoc();
        $count = $row['cnt'];
        $stmtCount->close();

        if ($count > 0) {
            $stmt1 = $conn->prepare("DELETE FROM receipts WHERE transaction_id IN (SELECT transaction_id FROM sales_transactions WHERE DATE(transaction_date) >= ? AND DATE(transaction_date) <= ?)");
            $stmt1->bind_param('ss', $start_date, $end_date);
            $stmt1->execute();
            $stmt1->close();

            $stmt2 = $conn->prepare("DELETE FROM sales_transactions WHERE DATE(transaction_date) >= ? AND DATE(transaction_date) <= ?");
            $stmt2->bind_param('ss', $start_date, $end_date);
            $stmt2->execute();
            $stmt2->close();
        }

        $conn->commit();

        // Reset auto-increment counters so the next transaction ID resumes from the highest remaining ID
        if ($count > 0) {
            $conn->query("ALTER TABLE receipts AUTO_INCREMENT = 1");
            $conn->query("ALTER TABLE sales_transactions AUTO_INCREMENT = 1");
        }

        echo json_encode(['success' => true, 'deleted_count' => $count]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    $conn->close();
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>