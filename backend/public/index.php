<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/postsClass.php';
require_once __DIR__ . '/../src/schedulingClass.php';

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
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$query = [];
parse_str(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_QUERY) ?? '', $query);
$trainerSessionIdMatches = [];
$trainerSessionDetailPath = preg_match('#^/api/trainer-sessions/(\d+)$#', $path, $trainerSessionIdMatches) === 1;
$trainerSessionCancelMatches = [];
$trainerSessionCancelPath = preg_match('#^/api/trainer-sessions/(\d+)/cancel$#', $path, $trainerSessionCancelMatches) === 1;

$postsClass = new PostsClass();
$schedulingClass = new SchedulingClass();

try {
  if ($method === 'GET' && $path === '/api/health') {
    send_json(200, ['ok' => true, 'service' => 'backend']);
    exit;
  }

  if ($method === 'GET' && $path === '/api/posts') {
    send_json(200, $postsClass->getPosts(db()));
    exit;
  }

  if ($method === 'POST' && $path === '/api/posts') {
    try {
      $row = $postsClass->createPost(db(), read_json_body());
      send_json(201, $row);
    } catch (InvalidArgumentException $err) {
      send_json(400, ['message' => $err->getMessage()]);
    }
    exit;
  }

  if ($method === 'GET' && $path === '/api/trainer-sessions') {
    $trainerId = isset($query['trainerId']) && $query['trainerId'] !== '' ? (int)$query['trainerId'] : null;
    send_json(200, $schedulingClass->getTrainerSessions(db(), $trainerId));
    exit;
  }

  if ($method === 'GET' && $path === '/api/trainer-sessions/available') {
    $trainerId = isset($query['trainerId']) && $query['trainerId'] !== '' ? (int)$query['trainerId'] : null;
    send_json(200, $schedulingClass->getAvailableTrainerSessions(db(), $trainerId));
    exit;
  }

  if ($method === 'POST' && $path === '/api/trainer-sessions') {
    try {
      $row = $schedulingClass->createTrainerSession(db(), read_json_body());
      send_json(201, $row);
    } catch (InvalidArgumentException $err) {
      send_json(400, ['message' => $err->getMessage()]);
    }
    exit;
  }

  if ($method === 'PUT' && $trainerSessionDetailPath) {
    try {
      $row = $schedulingClass->updateTrainerSession(db(), (int)$trainerSessionIdMatches[1], read_json_body());
      send_json(200, $row);
    } catch (InvalidArgumentException $err) {
      send_json(400, ['message' => $err->getMessage()]);
    }
    exit;
  }

  if ($method === 'POST' && $trainerSessionCancelPath) {
    try {
      $row = $schedulingClass->cancelTrainerSession(db(), (int)$trainerSessionCancelMatches[1]);
      send_json(200, $row);
    } catch (InvalidArgumentException $err) {
      send_json(400, ['message' => $err->getMessage()]);
    }
    exit;
  }

  if ($method === 'GET' && $path === '/api/client-sessions') {
    $clientId = isset($query['clientId']) ? (int)$query['clientId'] : 0;

    if ($clientId === 0) {
      send_json(400, ['message' => 'clientId is required']);
      exit;
    }

    send_json(200, $schedulingClass->getClientSessions(db(), $clientId));
    exit;
  }

  if ($method === 'POST' && $path === '/api/client-sessions') {
    try {
      $row = $schedulingClass->createClientSessionBooking(db(), read_json_body());
      send_json(201, $row);
    } catch (InvalidArgumentException $err) {
      send_json(400, ['message' => $err->getMessage()]);
    }
    exit;
  }

  if ($method === 'GET' && $path === '/') {
    send_json(200, ['ok' => true, 'message' => 'PHP backend is running. See /api/health, /api/posts, /api/trainer-sessions, and /api/client-sessions.']);
    exit;
  }

  send_json(404, ['message' => 'Not found']);
} catch (Throwable $err) {
  error_log((string)$err);
  send_json(500, ['message' => 'Internal server error']);
}
