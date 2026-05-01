<?php

declare(strict_types=1);

final class SignupClass
{
  public function signup(PDO $pdo, array $body): array
  {
    $username = isset($body['username']) ? trim((string)$body['username']) : '';
    $email = isset($body['email']) ? trim(strtolower((string)$body['email'])) : '';
    $password = isset($body['password']) ? (string)$body['password'] : '';
    $role = isset($body['role']) ? trim((string)$body['role']) : '';

    if ($username === '' || $email === '' || $password === '' || $role === '') {
      throw new InvalidArgumentException('username, email, password, and role are required');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      throw new InvalidArgumentException('email must be valid');
    }
    if ($role !== 'client' && $role !== 'trainer') {
      throw new InvalidArgumentException('role must be client or trainer');
    }
    if (strlen($password) < 8) {
      throw new InvalidArgumentException('password must be at least 8 characters');
    }

    $existingStmt = $pdo->prepare(
      'SELECT id FROM users WHERE email = :email OR username = :username LIMIT 1'
    );
    $existingStmt->execute([
      ':email' => $email,
      ':username' => $username,
    ]);

    if ($existingStmt->fetch()) {
      throw new InvalidArgumentException('An account with that email or username already exists');
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare(
      'INSERT INTO users (username, email, password_hash, role)
       VALUES (:username, :email, :password_hash, :role)
       RETURNING id, username, email, role, created_at AS "createdAt"'
    );
    $stmt->execute([
      ':username' => $username,
      ':email' => $email,
      ':password_hash' => $passwordHash,
      ':role' => $role,
    ]);

    $row = $stmt->fetch();
    return is_array($row) ? $row : [];
  }

  public function login(PDO $pdo, array $body): array
  {
    $email = isset($body['email']) ? trim(strtolower((string)$body['email'])) : '';
    $password = isset($body['password']) ? (string)$body['password'] : '';

    if ($email === '' || $password === '') {
      throw new InvalidArgumentException('email and password are required');
    }

    $stmt = $pdo->prepare(
      'SELECT id, username, email, password_hash, role, created_at AS "createdAt"
       FROM users
       WHERE email = :email
       LIMIT 1'
    );
    $stmt->execute([':email' => $email]);
    $row = $stmt->fetch();

    if (!is_array($row) || !password_verify($password, (string)($row['password_hash'] ?? ''))) {
      throw new InvalidArgumentException('Invalid email or password');
    }

    return [
      'id' => $row['id'],
      'username' => $row['username'],
      'email' => $row['email'],
      'role' => $row['role'],
      'createdAt' => $row['createdAt'],
    ];
  }
}
