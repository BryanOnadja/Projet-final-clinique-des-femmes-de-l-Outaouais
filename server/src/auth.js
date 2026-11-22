// Connexion (login), jetons JWT et vérification des droits.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const SECRET = process.env.JWT_SECRET || 'secret-de-developpement-a-changer';
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET absent de server/.env : un secret de développement est utilisé.');
}

function creerJeton(utilisateur) {
  return jwt.sign(
    { id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role },
    SECRET,
    { expiresIn: '8h' } // la session expire après une journée de travail
  );
}

function verifierJeton(jeton) {
  return jwt.verify(jeton, SECRET);
}

// Middleware : refuse toute requête sans jeton valide
function exigerConnexion(req, res, next) {
  const entete = req.headers.authorization || '';
  const jeton = entete.startsWith('Bearer ') ? entete.slice(7) : null;
  if (!jeton) return res.status(401).json({ erreur: 'Connexion requise' });
  try {
    req.utilisateur = verifierJeton(jeton);
    next();
  } catch {
    res.status(401).json({ erreur: 'Session expirée, reconnectez-vous' });
  }
}

// Middleware : réservé aux administratrices
function exigerAdmin(req, res, next) {
  if (req.utilisateur?.role !== 'admin') return res.status(403).json({ erreur: 'Réservé aux administratrices' });
  next();
}

const router = express.Router();

// POST /api/auth/login  { courriel, mot_de_passe }
router.post('/login', async (req, res, next) => {
  try {
    const { courriel, mot_de_passe } = req.body;
    if (!courriel || !mot_de_passe) return res.status(400).json({ erreur: 'Courriel et mot de passe requis' });

    const [lignes] = await db.query('SELECT * FROM utilisateurs WHERE courriel = ? AND actif = 1', [courriel.trim().toLowerCase()]);
    const utilisateur = lignes[0];
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
});

// GET /api/auth/me : qui est connecté
router.get('/me', exigerConnexion, (req, res) => {
  res.json({ utilisateur: req.utilisateur });
});

module.exports = { router, exigerConnexion, exigerAdmin, verifierJeton };
