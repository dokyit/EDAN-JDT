<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_response.php';
require_once __DIR__ . '/_db.php';
require_once __DIR__ . '/_auth.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'PATCH' && $method !== 'POST') {
    json_error('Method Not Allowed', 405);
}

require_admin();

$raw = file_get_contents('php://input');
$payload = json_decode($raw ?: '', true);
if (!is_array($payload)) {
    json_error('Invalid JSON payload', 422);
}

$id = (int)($payload['id'] ?? 0);
$status = trim((string)($payload['status'] ?? ''));

if ($id <= 0) {
    json_error('Valid order id is required', 422);
}

$allowedStatuses = ['received', 'in-progress', 'completed', 'rejected'];
if (!in_array($status, $allowedStatuses, true)) {
    json_error('Invalid status', 422, ['allowed' => $allowedStatuses]);
}

try {
    $conn = db();
    $stmt = $conn->prepare('UPDATE orders SET order_status = ? WHERE order_id = ?');
    if (!$stmt) {
        json_error('Failed to prepare update query', 500);
    }

    $stmt->bind_param('si', $status, $id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    if ($affected < 1) {
        $check = $conn->prepare('SELECT order_id FROM orders WHERE order_id = ? LIMIT 1');
        if (!$check) {
            $conn->close();
            json_error('Failed to prepare lookup query', 500);
        }

        $check->bind_param('i', $id);
        $check->execute();
        $existsResult = $check->get_result();
        $exists = $existsResult ? (bool)$existsResult->fetch_assoc() : false;
        $check->close();
        $conn->close();

        if (!$exists) {
            json_error('Order not found', 404);
        }

        json_success([
            'id' => $id,
            'status' => $status,
        ]);
    }

    $conn->close();

    json_success([
        'id' => $id,
        'status' => $status,
    ]);
} catch (Throwable $e) {
    json_error('Server error', 500, $e->getMessage());
}
