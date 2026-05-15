<?php
session_start();
require 'db.php';

$action = $_GET['action'] ?? '';

// CHECK SESSION
if ($action === 'check') {
    header('Content-Type: application/json');
    echo json_encode(['loggedIn' => isset($_SESSION['user_id'])]);
    exit;
}

// LOGOUT
if ($action === 'logout') {
    session_destroy();
    header('Location: ../index.html');
    exit;
}

// LOGIN 
if ($action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($password, $row['password'])) {
            $_SESSION['user_id'] = $row['user_id'];
            $_SESSION['username'] = $row['username'];
            echo json_encode(['success' => true]);
            $stmt->close();
            $conn->close();
            exit;
        }
    }

    $stmt->close();
    $conn->close();
    echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    exit;
}

// CHANGE CREDENTIALS
if ($action === 'change_credentials') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $currentPassword  = trim($data['current_password']  ?? '');
    $newUsername      = trim($data['new_username']       ?? '');
    $newPassword      = trim($data['new_password']       ?? '');
    $confirmPassword  = trim($data['confirm_password']   ?? '');

    if (!$currentPassword || !$newUsername || !$newPassword || !$confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    if ($newPassword !== $confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'New passwords do not match.']);
        exit;
    }

    if (strlen($newPassword) < 6) {
        echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters.']);
        exit;
    }

    $userId = $_SESSION['user_id'];

    // Verify current password
    $stmt = $conn->prepare("SELECT password FROM users WHERE user_id = ?");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user || !password_verify($currentPassword, $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
        exit;
    }

    // Check if username is already taken
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ? AND user_id != ?");
    $stmt->bind_param('si', $newUsername, $userId);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Username already taken.']);
        $stmt->close();
        exit;
    }
    $stmt->close();

    // Update credentials
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET username = ?, password = ? WHERE user_id = ?");
    $stmt->bind_param('ssi', $newUsername, $hashedPassword, $userId);

    if ($stmt->execute()) {
        $_SESSION['username'] = $newUsername;
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>
