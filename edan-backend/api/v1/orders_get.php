<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_response.php';
require_once __DIR__ . '/_db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_error('Method Not Allowed', 405);
}

$idRaw = trim((string)($_GET['id'] ?? ''));
if ($idRaw === '') {
    json_error('Order id is required', 422);
}

$normalized = strtoupper($idRaw);
if (str_starts_with($normalized, 'EDAN-')) {
    $normalized = substr($normalized, 5);
}

if (!ctype_digit($normalized)) {
    json_error('Valid order id is required (e.g. EDAN-12)', 422);
}

$id = (int)$normalized;
if ($id <= 0) {
    json_error('Valid order id is required', 422);
}

try {
    $conn = db();
    $stmt = $conn->prepare(
        'SELECT order_id, first_name, last_name, email, order_desc, order_status, order_date, file_path FROM orders WHERE order_id = ? LIMIT 1'
    );
    if (!$stmt) {
        json_error('Failed to prepare statement', 500);
    }

    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $order = $result ? $result->fetch_assoc() : null;
    $stmt->close();
    $conn->close();

    if (!$order) {
        json_error('Order not found', 404);
    }

    json_success($order);
} catch (Throwable $e) {
    json_error('Server error', 500, $e->getMessage());
}
