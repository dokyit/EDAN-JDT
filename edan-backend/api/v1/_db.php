<?php
declare(strict_types=1);

function db(): mysqli
{
    $host = getenv('EDAN_DB_HOST') ?: 'localhost';
    $user = getenv('EDAN_DB_USER') ?: 'root';
    $pass = getenv('EDAN_DB_PASS') ?: '';
    $name = getenv('EDAN_DB_NAME') ?: 'jdt_db';
    $port = (int)(getenv('EDAN_DB_PORT') ?: 3306);

    $conn = new mysqli($host, $user, $pass, $name, $port);
    if ($conn->connect_error) {
        throw new RuntimeException('DB connection failed: ' . $conn->connect_error);
    }

    $conn->set_charset('utf8mb4');
    return $conn;
}
