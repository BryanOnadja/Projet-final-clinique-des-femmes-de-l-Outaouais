import express from 'express';
import { login, me } from '../controllers/AuthController.js';
import { exigerConnexion } from '../middleware/auth.js';

const router = express.Router();

router.post('/api/auth/login', login);
router.get('/api/auth/me', exigerConnexion, me);

export default router;
