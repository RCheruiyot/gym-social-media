import { Request, Response } from 'express';
import { pool } from '../db';

type PostPayload = {
  title: string;
  content: string;
  authorName: string;
};

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  res.json({ ok: true, service: 'backend' });
};

export const getPosts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, title, content, author_name AS "authorName", created_at AS "createdAt" FROM posts ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  const { title, content, authorName } = req.body as Partial<PostPayload>;

  if (!title || !content || !authorName) {
    res.status(400).json({ message: 'title, content, and authorName are required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO posts (title, content, author_name)
       VALUES ($1, $2, $3)
       RETURNING id, title, content, author_name AS "authorName", created_at AS "createdAt"`,
      [title, content, authorName]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create post:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};
