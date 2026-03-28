<?php

declare(strict_types=1);

final class PostsClass
{
  public function getPosts(PDO $pdo): array
  {
    $stmt = $pdo->query(
      'SELECT id, title, content, author_name AS "authorName", created_at AS "createdAt" FROM posts ORDER BY created_at DESC'
    );

    return $stmt->fetchAll();
  }

  public function createPost(PDO $pdo, array $body): array
  {
    $title = isset($body['title']) ? trim((string)$body['title']) : '';
    $content = isset($body['content']) ? trim((string)$body['content']) : '';
    $authorName = isset($body['authorName']) ? trim((string)$body['authorName']) : '';

    if ($title === '' || $content === '' || $authorName === '') {
      throw new InvalidArgumentException('title, content, and authorName are required');
    }

    $stmt = $pdo->prepare(
      'INSERT INTO posts (title, content, author_name) VALUES (:title, :content, :author_name)
       RETURNING id, title, content, author_name AS "authorName", created_at AS "createdAt"'
    );

    $stmt->execute([
      ':title' => $title,
      ':content' => $content,
      ':author_name' => $authorName,
    ]);

    $row = $stmt->fetch();
    return is_array($row) ? $row : [];
  }
}
