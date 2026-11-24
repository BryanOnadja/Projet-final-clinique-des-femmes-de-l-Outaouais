// Contrôleur : connexion de l'équipe.
import bcrypt from 'bcryptjs';
import { trouverParCourriel } from '../models/UtilisateurModel.js';
import { creerJeton } from '../middleware/auth.js';

// POST /api/auth/login  { courriel, mot_de_passe }
export async function login(req, res, next) {
  try {
    const { courriel, mot_de_passe } = req.body;
    if (!courriel || !mot_de_passe) return res.status(400).json({ erreur: 'Courriel et mot de passe requis' });

    const utilisateur = await trouverParCourriel(courriel.trim().toLowerCase());
    // Même message dans les deux cas : on ne révèle pas si le courriel existe
    if (!utilisateur || !(await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe_hash))) {
      return res.status(401).json({ erreur: 'Courriel ou mot de passe incorrect' });
    }

    res.json({
      jeton: creerJeton(utilisateur),
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, courriel: utilisateur.courriel, role: utilisateur.role },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me : qui est connecté
export function me(req, res) {
  res.json({ utilisateur: req.utilisateur });
}
