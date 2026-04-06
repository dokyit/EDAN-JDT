<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_response.php';
require_once __DIR__ . '/_db.php';
require_once __DIR__ . '/_auth.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'DELETE') {
    json_error('Method Not Allowed', 405);
}

require_admin();

$idRaw = $_GET['id'] ?? null;
if ($idRaw === null || !is_numeric((string)$idRaw)) {
    json_error('Valid numeric id is required', 422);
}

$id = (int)$idRaw;
if ($id <= 0) {
    json_error('Valid numeric id is required', 422);
}

try {
    $conn = db();
    $stmt = $conn->prepare('DELETE FROM orders WHERE order_id = ?');
    if (!$stmt) {
        json_error('Failed to prepare delete query', 500);
    }

    $stmt->bind_param('i', $id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $conn->close();

    if ($affected < 1) {
        json_error('Order not found', 404);
    }

    json_success([
        'deleted' => true,
        'id' => $id,
    ]);
} catch (Throwable $e) {
    json_error('Server error', 500, $e->getMessage());
}
