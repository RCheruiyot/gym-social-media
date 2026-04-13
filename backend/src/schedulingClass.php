<?php

declare(strict_types=1);

final class SchedulingClass
{
  public function getAvailableTrainerSessions(PDO $pdo, ?int $trainerId = null): array
  {
    $sql = 'SELECT ts.id AS "sessionId", ts.start_time AS "startTime", ts.end_time AS "endTime",
                   ts.trainer_id AS "trainerId", ts.title, ts.description, ts.location, ts.status,
                   ts.created_at AS "createdAt"
            FROM trainer_sessions ts
            LEFT JOIN client_sessions cs ON cs.session_id = ts.id
            WHERE cs.id IS NULL
              AND ts.status = \'active\'';

    if ($trainerId !== null) {
      $sql .= ' AND ts.trainer_id = :trainer_id';
      $sql .= ' ORDER BY ts.start_time ASC';
      $stmt = $pdo->prepare($sql);
      $stmt->execute([':trainer_id' => $trainerId]);
      return $stmt->fetchAll();
    }

    $sql .= ' ORDER BY ts.start_time ASC';
    $stmt = $pdo->query($sql);
    return $stmt->fetchAll();
  }

  public function getTrainerSessions(PDO $pdo, ?int $trainerId = null): array
  {
    if ($trainerId !== null) {
      $stmt = $pdo->prepare(
        'SELECT id, start_time AS "startTime", end_time AS "endTime", trainer_id AS "trainerId",
                title, description, location, status, created_at AS "createdAt"
         FROM trainer_sessions
         WHERE trainer_id = :trainer_id
         ORDER BY created_at DESC'
      );
      $stmt->execute([':trainer_id' => $trainerId]);
      return $stmt->fetchAll();
    }

    $stmt = $pdo->query(
      'SELECT id, start_time AS "startTime", end_time AS "endTime", trainer_id AS "trainerId",
              title, description, location, status, created_at AS "createdAt"
       FROM trainer_sessions
       ORDER BY created_at DESC'
    );
    return $stmt->fetchAll();
  }

  public function createTrainerSession(PDO $pdo, array $body): array
  {
    $startTime = isset($body['startTime']) ? (int)$body['startTime'] : 0;
    $endTime = isset($body['endTime']) ? (int)$body['endTime'] : 0;
    $trainerId = isset($body['trainerId']) ? (int)$body['trainerId'] : 0;
    $title = isset($body['title']) ? trim((string)$body['title']) : 'Availability Hold';
    $description = isset($body['description']) ? trim((string)$body['description']) : '';
    $location = isset($body['location']) ? trim((string)$body['location']) : '';
    $status = isset($body['status']) ? trim((string)$body['status']) : 'active';

    if ($startTime === 0 || $endTime === 0 || $trainerId === 0) {
      throw new InvalidArgumentException('startTime, endTime, and trainerId are required');
    }
    if ($title === '') {
      throw new InvalidArgumentException('title is required');
    }
    if ($endTime <= $startTime) {
      throw new InvalidArgumentException('endTime must be greater than startTime');
    }

    $stmt = $pdo->prepare(
      'INSERT INTO trainer_sessions (start_time, end_time, trainer_id, title, description, location, status)
       VALUES (:start_time, :end_time, :trainer_id, :title, :description, :location, :status)
       RETURNING id, start_time AS "startTime", end_time AS "endTime", trainer_id AS "trainerId",
                 title, description, location, status, created_at AS "createdAt"'
    );

    $stmt->execute([
      ':start_time' => $startTime,
      ':end_time' => $endTime,
      ':trainer_id' => $trainerId,
      ':title' => $title,
      ':description' => $description,
      ':location' => $location,
      ':status' => $status,
    ]);
        
    $row = $stmt->fetch();
    return is_array($row) ? $row : [];
  }

  public function updateTrainerSession(PDO $pdo, int $sessionId, array $body): array
  {
    $startTime = isset($body['startTime']) ? (int)$body['startTime'] : 0;
    $endTime = isset($body['endTime']) ? (int)$body['endTime'] : 0;
    $trainerId = isset($body['trainerId']) ? (int)$body['trainerId'] : 0;
    $title = isset($body['title']) ? trim((string)$body['title']) : '';
    $description = isset($body['description']) ? trim((string)$body['description']) : '';
    $location = isset($body['location']) ? trim((string)$body['location']) : '';
    $status = isset($body['status']) ? trim((string)$body['status']) : 'active';

    if ($sessionId === 0 || $startTime === 0 || $endTime === 0 || $trainerId === 0) {
      throw new InvalidArgumentException('sessionId, startTime, endTime, and trainerId are required');
    }
    if ($title === '') {
      throw new InvalidArgumentException('title is required');
    }
    if ($endTime <= $startTime) {
      throw new InvalidArgumentException('endTime must be greater than startTime');
    }

    $stmt = $pdo->prepare(
      'UPDATE trainer_sessions
       SET start_time = :start_time, end_time = :end_time, trainer_id = :trainer_id,
           title = :title, description = :description, location = :location, status = :status
       WHERE id = :session_id
       RETURNING id, start_time AS "startTime", end_time AS "endTime", trainer_id AS "trainerId",
                 title, description, location, status, created_at AS "createdAt"'
    );

    $stmt->execute([
      ':session_id' => $sessionId,
      ':start_time' => $startTime,
      ':end_time' => $endTime,
      ':trainer_id' => $trainerId,
      ':title' => $title,
      ':description' => $description,
      ':location' => $location,
      ':status' => $status,
    ]);

    $row = $stmt->fetch();
    if (!is_array($row)) {
      throw new InvalidArgumentException('Trainer session not found');
    }

    return $row;
  }

  public function cancelTrainerSession(PDO $pdo, int $sessionId): array
  {
    if ($sessionId === 0) {
      throw new InvalidArgumentException('sessionId is required');
    }

    $stmt = $pdo->prepare(
      'UPDATE trainer_sessions
       SET status = \'cancelled\'
       WHERE id = :session_id
       RETURNING id, start_time AS "startTime", end_time AS "endTime", trainer_id AS "trainerId",
                 title, description, location, status, created_at AS "createdAt"'
    );
    $stmt->execute([':session_id' => $sessionId]);

    $row = $stmt->fetch();
    if (!is_array($row)) {
      throw new InvalidArgumentException('Trainer session not found');
    }

    return $row;
  }

  public function getClientSessions(PDO $pdo, int $clientId): array
  {
    $stmt = $pdo->prepare(
      'SELECT cs.id AS "bookingId", cs.session_id AS "sessionId", cs.client_id AS "clientId",
              ts.start_time AS "startTime", ts.end_time AS "endTime", ts.trainer_id AS "trainerId",
              ts.title, ts.description, ts.location, ts.status,
              cs.created_at AS "createdAt"
       FROM client_sessions cs
       INNER JOIN trainer_sessions ts ON ts.id = cs.session_id
       WHERE cs.client_id = :client_id
       ORDER BY ts.start_time ASC'
    );
    $stmt->execute([':client_id' => $clientId]);

    return $stmt->fetchAll();
  }

  public function createClientSessionBooking(PDO $pdo, array $body): array
  {
    $sessionId = isset($body['sessionId']) ? (int)$body['sessionId'] : 0;
    $clientId = isset($body['clientId']) ? (int)$body['clientId'] : 0;

    if ($sessionId === 0 || $clientId === 0) {
      throw new InvalidArgumentException('sessionId and clientId are required');
    }

    $pdo->beginTransaction();

    try {
      $sessionStmt = $pdo->prepare(
        'SELECT id, start_time AS "startTime", end_time AS "endTime", trainer_id AS "trainerId"
                , title, description, location, status
         FROM trainer_sessions
         WHERE id = :session_id
         FOR UPDATE'
      );
      $sessionStmt->execute([':session_id' => $sessionId]);
      $session = $sessionStmt->fetch();

      if (!is_array($session)) {
        throw new InvalidArgumentException('Trainer session not found');
      }
      if (($session['status'] ?? '') !== 'active') {
        throw new InvalidArgumentException('This session is not available for booking');
      }

      $existingStmt = $pdo->prepare(
        'SELECT id FROM client_sessions WHERE session_id = :session_id FOR UPDATE'
      );
      $existingStmt->execute([':session_id' => $sessionId]);

      if ($existingStmt->fetch()) {
        throw new InvalidArgumentException('This session has already been booked');
      }

      $insertStmt = $pdo->prepare(
        'INSERT INTO client_sessions (session_id, client_id)
         VALUES (:session_id, :client_id)
         RETURNING id AS "bookingId", session_id AS "sessionId", client_id AS "clientId", created_at AS "createdAt"'
      );
      $insertStmt->execute([
        ':session_id' => $sessionId,
        ':client_id' => $clientId,
      ]);

      $booking = $insertStmt->fetch();
      $pdo->commit();

      return array_merge(is_array($booking) ? $booking : [], $session);
    } catch (Throwable $err) {
      if ($pdo->inTransaction()) {
        $pdo->rollBack();
      }
      throw $err;
    }
  }
}
