<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_response.php';
require_once __DIR__ . '/_db.php';
require_once __DIR__ . '/_auth.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_error('Method Not Allowed', 405);
}

require_admin();

$status = trim((string)($_GET['status'] ?? ''));
$email = trim((string)($_GET['email'] ?? ''));
$page = max(1, (int)($_GET['page'] ?? 1));
$pageSize = (int)($_GET['pageSize'] ?? 20);
$pageSize = min(100, max(1, $pageSize));
$offset = ($page - 1) * $pageSize;

$allowedStatuses = ['received', 'in-progress', 'completed', 'rejected'];
if ($status !== '' && !in_array($status, $allowedStatuses, true)) {
    json_error('Invalid status filter', 422, ['allowed' => $allowedStatuses]);
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Invalid email filter', 422);
}

try {
    $conn = db();

    $where = [];
    $bindTypes = '';
    $bindValues = [];

    if ($status !== '') {
        $where[] = 'order_status = ?';
        $bindTypes .= 's';
        $bindValues[] = $status;
    }

    if ($email !== '') {
        $where[] = 'email = ?';
        $bindTypes .= 's';
        $bindValues[] = $email;
    }

    $whereSql = count($where) ? (' WHERE ' . implode(' AND ', $where)) : '';

    $countSql = 'SELECT COUNT(*) AS total FROM orders' . $whereSql;
    $countStmt = $conn->prepare($countSql);
    if (!$countStmt) {
        json_error('Failed to prepare count query', 500);
    }

    if ($bindTypes !== '') {
        $countStmt->bind_param($bindTypes, ...$bindValues);
    }

    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $total = (int)(($countResult ? $countResult->fetch_assoc() : ['total' => 0])['total'] ?? 0);
    $countStmt->close();

    $sql = 'SELECT order_id, first_name, last_name, email, order_desc, order_status, order_date, file_path FROM orders'
        . $whereSql
        . ' ORDER BY order_date DESC, order_id DESC LIMIT ? OFFSET ?';

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        json_error('Failed to prepare list query', 500);
    }

    $listTypes = $bindTypes . 'ii';
    $listValues = [...$bindValues, $pageSize, $offset];
    $stmt->bind_param($listTypes, ...$listValues);
    $stmt->execute();
    $result = $stmt->get_result();

    $items = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
    }

    $stmt->close();
    $conn->close();

    json_success([
        'items' => $items,
        'page' => $page,
        'pageSize' => $pageSize,
        'total' => $total,
    ]);
} catch (Throwable $e) {
    json_error('Server error', 500, $e->getMessage());
}
