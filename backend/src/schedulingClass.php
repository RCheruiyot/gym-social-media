<?php

declare(strict_types=1);

final class SchedulingClass
{
  public function getTrainerSessions(PDO $pdo, ?int $trainerId = null): array
  {
    if ($trainerId !== null) {
      $stmt = $pdo->prepare(
        'SELECT id, start_time AS "startTime", end_time AS "endTime", trainer_id AS "trainerId", created_at AS "createdAt"
         FROM trainer_sessions
         WHERE trainer_id = :trainer_id
         ORDER BY created_at DESC'
      );
      $stmt->execute([':trainer_id' => $trainerId]);
      return $stmt->fetchAll();
    }

    $stmt = $pdo->query(
      'SELECT id, start_time AS "startTime", end_time AS "endTime", trainer_id AS "trainerId", created_at AS "createdAt"
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

    if ($startTime === 0 || $endTime === 0 || $trainerId === 0) {
      throw new InvalidArgumentException('startTime, endTime, and trainerId are required');
    }
    if ($endTime <= $startTime) {
      throw new InvalidArgumentException('endTime must be greater than startTime');
    }

    $stmt = $pdo->prepare(
      'INSERT INTO trainer_sessions (start_time, end_time, trainer_id) VALUES (:start_time, :end_time, :trainer_id)
       RETURNING id, start_time AS "startTime", end_time AS "endTime", trainer_id AS "trainerId", created_at AS "createdAt"'
    );

    $stmt->execute([
      ':start_time' => $startTime,
      ':end_time' => $endTime,
      ':trainer_id' => $trainerId,
    ]);
        
    $row = $stmt->fetch();
    return is_array($row) ? $row : [];
  }
}
