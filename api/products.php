<?php
session_start();
require 'db.php';

$action = $_GET['action'] ?? '';

// GET PRODUCTS
if ($action === 'get') {
    $search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) . '%' : '%';

    $stmt = $conn->prepare("SELECT product_id, product_name, price, expiration_date 
                            FROM products 
                            WHERE product_name LIKE ? 
                            ORDER BY product_name ASC");
    $stmt->bind_param('s', $search);
    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }

    echo json_encode($products);
    $stmt->close();
    $conn->close();
    exit;
}

// All write actions require auth
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// ADD PRODUCT 
if ($action === 'add') {
    $name  = trim($data['product_name'] ?? '');
    $price = floatval($data['price'] ?? 0);
    $exp_date = !empty($data['expiration_date']) ? $data['expiration_date'] : null;

    if ($name === '' || $price <= 0) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all fields (Expiration Date is optional but recommended)']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO products (product_name, price, expiration_date, created_at, updated_at) 
                            VALUES (?, ?, ?, NOW(), NOW())");
    $stmt->bind_param('sds', $name, $price, $exp_date);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

// EDIT PRODUCT 
if ($action === 'edit') {
    $id    = intval($data['product_id'] ?? 0);
    $name  = trim($data['product_name'] ?? '');
    $price = floatval($data['price'] ?? 0);
    $exp_date = !empty($data['expiration_date']) ? $data['expiration_date'] : null;

    if ($id <= 0 || $name === '' || $price <= 0) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all fields']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE products 
                            SET product_name = ?, price = ?, expiration_date = ?, updated_at = NOW() 
                            WHERE product_id = ?");
    $stmt->bind_param('sdsi', $name, $price, $exp_date, $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

// DELETE PRODUCT
if ($action === 'delete') {
    $id = intval($data['product_id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid ID']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM products WHERE product_id = ?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>
