<?php
declare(strict_types=1);

function json_success($data = null, int $status = 200): void
{
    http_response_code($status);
    echo json_encode([
        'success' => true,
        'data' => $data,
        'error' => null,
    ]);
    exit;
}

function json_error(string $message, int $status = 400, $details = null): void
{
    http_response_code($status);
    echo json_encode([
        'success' => false,
        'data' => null,
        'error' => [
            'message' => $message,
            'details' => $details,
        ],
    ]);
    exit;
}
