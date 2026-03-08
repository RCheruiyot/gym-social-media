import { Router } from 'express';
import { createPost, getHealth, getPosts } from '../controllers';

export const router = Router();

router.get('/health', getHealth);
router.get('/posts', getPosts);
router.post('/posts', createPost);
