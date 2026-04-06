<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_response.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_error('Method Not Allowed', 405);
}

if (empty($_SESSION['admin_id'])) {
    json_error('Unauthorized', 401);
}

json_success([
    'admin_id' => (int)$_SESSION['admin_id'],
    'email' => (string)($_SESSION['admin_email'] ?? ''),
    'role' => (string)($_SESSION['role'] ?? 'admin'),
]);
