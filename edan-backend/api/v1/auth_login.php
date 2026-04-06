<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_response.php';
require_once __DIR__ . '/_db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    json_error('Method Not Allowed', 405);
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw ?: '', true);
if (!is_array($payload)) {
    json_error('Invalid JSON payload', 422);
}

$email = trim((string)($payload['email'] ?? ''));
$password = (string)($payload['password'] ?? '');

if ($email === '' || $password === '') {
    json_error('Email and password are required', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Invalid email format', 422);
}

try {
    $conn = db();
    $stmt = $conn->prepare('SELECT admin_id, email, password_hash, role FROM admins WHERE email = ? LIMIT 1');
    if (!$stmt) {
        json_error('Failed to prepare statement', 500);
    }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $admin = $result ? $result->fetch_assoc() : null;
    $stmt->close();
    $conn->close();

    if (!$admin || !password_verify($password, (string)$admin['password_hash'])) {
        json_error('Invalid credentials', 401);
    }

    $_SESSION['admin_id'] = (int)$admin['admin_id'];
    $_SESSION['admin_email'] = (string)$admin['email'];
    $_SESSION['role'] = (string)$admin['role'];

    json_success([
        'admin_id' => (int)$admin['admin_id'],
        'email' => (string)$admin['email'],
        'role' => (string)$admin['role'],
    ]);
} catch (Throwable $e) {
    json_error('Server error', 500, $e->getMessage());
}
