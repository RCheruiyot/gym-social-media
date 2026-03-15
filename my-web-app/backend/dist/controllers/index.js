"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = exports.getPosts = exports.getHealth = void 0;
const db_1 = require("../db");
const getHealth = async (_req, res) => {
    res.json({ ok: true, service: 'backend' });
};
exports.getHealth = getHealth;
const getPosts = async (_req, res) => {
    try {
        const result = await db_1.pool.query('SELECT id, title, content, author_name AS "authorName", created_at AS "createdAt" FROM posts ORDER BY created_at DESC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Failed to fetch posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
};
exports.getPosts = getPosts;
const createPost = async (req, res) => {
    const { title, content, authorName } = req.body;
    if (!title || !content || !authorName) {
        res.status(400).json({ message: 'title, content, and authorName are required' });
        return;
    }
    try {
        const result = await db_1.pool.query(`INSERT INTO posts (title, content, author_name)
       VALUES ($1, $2, $3)
       RETURNING id, title, content, author_name AS "authorName", created_at AS "createdAt"`, [title, content, authorName]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Failed to create post:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};
exports.createPost = createPost;
