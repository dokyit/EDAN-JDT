<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_response.php';
require_once __DIR__ . '/_db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_error('Method Not Allowed', 405);
}

$email = trim((string)($_GET['email'] ?? ''));
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Valid email is required', 422);
}

try {
    $conn = db();
    $stmt = $conn->prepare(
        'SELECT order_id, first_name, last_name, email, order_desc, order_status, order_date, file_path FROM orders WHERE email = ? ORDER BY order_date DESC, order_id DESC'
    );
    if (!$stmt) {
        json_error('Failed to prepare statement', 500);
    }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $orders = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
    }

    $stmt->close();
    $conn->close();

    json_success($orders);
} catch (Throwable $e) {
    json_error('Server error', 500, $e->getMessage());
}
