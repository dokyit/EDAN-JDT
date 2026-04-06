<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_response.php';
require_once __DIR__ . '/_db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    json_error('Method Not Allowed', 405);
}

$firstName = trim((string)($_POST['fname'] ?? ''));
$lastName = trim((string)($_POST['lname'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$details = trim((string)($_POST['details'] ?? ''));

if ($firstName === '' || $lastName === '' || $email === '' || $details === '') {
    json_error('First name, last name, email, and details are required', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Invalid email format', 422);
}

if (strlen($firstName) > 100 || strlen($lastName) > 100 || strlen($email) > 255) {
    json_error('Input exceeds max length', 422);
}

if (strlen($details) > 5000) {
    json_error('Order details are too long', 422);
}

$filePath = null;
if (isset($_FILES['design']) && is_array($_FILES['design']) && (int)($_FILES['design']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
    $file = $_FILES['design'];
    $uploadError = (int)($file['error'] ?? UPLOAD_ERR_OK);
    if ($uploadError !== UPLOAD_ERR_OK) {
        json_error('File upload failed', 422, ['code' => $uploadError]);
    }

    $size = (int)($file['size'] ?? 0);
    $maxBytes = 8 * 1024 * 1024;
    if ($size <= 0 || $size > $maxBytes) {
        json_error('File size must be between 1 byte and 8 MB', 422);
    }

    $originalName = (string)($file['name'] ?? 'upload.bin');
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowed = ['png', 'jpg', 'jpeg', 'pdf', 'ai', 'svg', 'eps'];
    if (!in_array($ext, $allowed, true)) {
        json_error('Invalid file type', 422, ['allowed' => $allowed]);
    }

    $targetDir = realpath(__DIR__ . '/../../uploads/orders');
    if ($targetDir === false) {
        json_error('Upload directory not found', 500);
    }

    $safeBase = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
    $safeBase = $safeBase !== '' ? $safeBase : 'design';
    $targetName = sprintf('%s_%s.%s', date('Ymd_His'), bin2hex(random_bytes(4)), $ext);
    $targetPath = $targetDir . DIRECTORY_SEPARATOR . $targetName;

    if (!move_uploaded_file((string)$file['tmp_name'], $targetPath)) {
        json_error('Failed to save uploaded file', 500);
    }

    $filePath = '/uploads/orders/' . $targetName;
}

try {
    $conn = db();
    $result = $conn->query('SELECT order_id FROM orders ORDER BY order_id ASC');
    if (!$result) {
        $conn->close();
        json_error('Failed to compute next order id', 500);
    }

    $nextId = 1;
    while ($row = $result->fetch_assoc()) {
        $currentId = (int)($row['order_id'] ?? 0);
        if ($currentId === $nextId) {
            $nextId++;
            continue;
        }

        if ($currentId > $nextId) {
            break;
        }
    }

    $stmt = $conn->prepare(
        'INSERT INTO orders (order_id, order_desc, file_path, order_date, order_status, email, first_name, last_name) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)'
    );
    if (!$stmt) {
        $conn->close();
        json_error('Failed to prepare statement', 500);
    }

    $defaultStatus = 'received';
    $stmt->bind_param('issssss', $nextId, $details, $filePath, $defaultStatus, $email, $firstName, $lastName);
    $ok = $stmt->execute();
    if (!$ok) {
        $stmt->close();
        $conn->close();
        json_error('Failed to create order', 500);
    }

    $orderId = $nextId;
    $stmt->close();
    $conn->close();

    json_success([
        'order_id' => $orderId,
        'order_code' => 'EDAN-' . $orderId,
        'order_status' => $defaultStatus,
    ], 201);
} catch (Throwable $e) {
    json_error('Server error', 500, $e->getMessage());
}
