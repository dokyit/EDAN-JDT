<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_response.php';
require_once __DIR__ . '/_db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_error('Method Not Allowed', 405);
}

try {
    $conn = db();
    $res = $conn->query('SELECT 1 AS ok');
    $ok = $res ? (int)($res->fetch_assoc()['ok'] ?? 0) : 0;
    $conn->close();

    if ($ok !== 1) {
        json_error('Database health check failed', 500);
    }

    json_success([
        'service' => 'edan-backend',
        'db' => 'ok',
        'time' => gmdate('c'),
    ]);
} catch (Throwable $e) {
    json_error('Health check failed', 500, $e->getMessage());
}
