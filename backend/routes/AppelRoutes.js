import express from 'express';
import { getAppels, getAppel, createAppel, updateAppel, addAction } from '../controllers/AppelController.js';
import { exigerConnexion } from '../middleware/auth.js';

const router = express.Router();

// Toutes ces routes exigent d'être connectée
router.get('/api/appels', exigerConnexion, getAppels);
router.get('/api/appels/:id', exigerConnexion, getAppel);
router.post('/api/appels', exigerConnexion, createAppel);
router.patch('/api/appels/:id', exigerConnexion, updateAppel);
router.post('/api/appels/:id/actions', exigerConnexion, addAction);

export default router;
