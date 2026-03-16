<?php

declare(strict_types=1);

function send_json(int $status, array $body): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($body);
}

function parse_database_url(string $databaseUrl): array {
  $parts = parse_url($databaseUrl);
  if ($parts === false) {
    throw new RuntimeException('Invalid DATABASE_URL');
  }

  $host = $parts['host'] ?? 'localhost';
  $port = (int)($parts['port'] ?? 5432);
  $user = $parts['user'] ?? 'postgres';
  $pass = $parts['pass'] ?? 'postgres';
  $path = $parts['path'] ?? '/gym_social';
  $dbName = ltrim($path, '/');

  return [$host, $port, $user, $pass, $dbName];
}

function db(): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) {
    return $pdo;
  }

  $databaseUrl = getenv('DATABASE_URL') ?: 'postgresql://postgres:postgres@localhost:5432/gym_social';
  [$host, $port, $user, $pass, $dbName] = parse_database_url($databaseUrl);

  $dsn = "pgsql:host={$host};port={$port};dbname={$dbName}";
  $pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);

  return $pdo;
}

function read_json_body(): array {
  $raw = file_get_contents('php://input');
  if ($raw === false || $raw === '') {
    return [];
  }

  $decoded = json_decode($raw, true);
  if (!is_array($decoded)) {
    throw new RuntimeException('Invalid JSON body');
  }

  return $decoded;
}

// Basic CORS for dev
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

try {
  if ($method === 'GET' && $path === '/api/health') {
    send_json(200, ['ok' => true, 'service' => 'backend']);
    exit;
  }

  if ($method === 'GET' && $path === '/api/posts') {
    $stmt = db()->query(
      'SELECT id, title, content, author_name AS "authorName", created_at AS "createdAt" FROM posts ORDER BY created_at DESC'
    );
    send_json(200, $stmt->fetchAll());
    exit;
  }

  if ($method === 'POST' && $path === '/api/posts') {
    $body = read_json_body();

    $title = isset($body['title']) ? trim((string)$body['title']) : '';
    $content = isset($body['content']) ? trim((string)$body['content']) : '';
    $authorName = isset($body['authorName']) ? trim((string)$body['authorName']) : '';

    if ($title === '' || $content === '' || $authorName === '') {
      send_json(400, ['message' => 'title, content, and authorName are required']);
      exit;
    }

    $stmt = db()->prepare(
      'INSERT INTO posts (title, content, author_name) VALUES (:title, :content, :author_name)
       RETURNING id, title, content, author_name AS "authorName", created_at AS "createdAt"'
    );
    $stmt->execute([
      ':title' => $title,
      ':content' => $content,
      ':author_name' => $authorName,
    ]);

    $row = $stmt->fetch();
    send_json(201, is_array($row) ? $row : []);
    exit;
  }

  if ($method === 'GET' && $path === '/') {
    send_json(200, ['ok' => true, 'message' => 'PHP backend is running. See /api/health and /api/posts.']);
    exit;
  }

  send_json(404, ['message' => 'Not found']);
} catch (Throwable $err) {
  error_log((string)$err);
  send_json(500, ['message' => 'Internal server error']);
}
