import express from 'express';
import {
  getNotesRapides, createNoteRapide, updateNoteRapide,
  getServices, createService, updateService,
  getUtilisateurs, createUtilisateur, updateUtilisateur,
} from '../controllers/ConfigurationController.js';
import { exigerConnexion, exigerAdmin } from '../middleware/auth.js';

const router = express.Router();

// Notes rapides : lecture pour toutes, modification pour les administratrices
router.get('/api/notes-rapides', exigerConnexion, getNotesRapides);
router.post('/api/notes-rapides', exigerConnexion, exigerAdmin, createNoteRapide);
router.patch('/api/notes-rapides/:id', exigerConnexion, exigerAdmin, updateNoteRapide);

// Services
router.get('/api/services', exigerConnexion, getServices);
router.post('/api/services', exigerConnexion, exigerAdmin, createService);
router.patch('/api/services/:id', exigerConnexion, exigerAdmin, updateService);

// Comptes de l'équipe : administratrices seulement
router.get('/api/utilisateurs', exigerConnexion, exigerAdmin, getUtilisateurs);
router.post('/api/utilisateurs', exigerConnexion, exigerAdmin, createUtilisateur);
router.patch('/api/utilisateurs/:id', exigerConnexion, exigerAdmin, updateUtilisateur);

export default router;
