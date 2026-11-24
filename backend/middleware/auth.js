// Jetons JWT et vérification des droits (middlewares Express).
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret-de-developpement-a-changer';
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET absent de backend/.env : un secret de développement est utilisé.');
}

export function creerJeton(utilisateur) {
  return jwt.sign(
    { id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role },
    SECRET,
    { expiresIn: '8h' } // la session expire après une journée de travail
  );
}

export function verifierJeton(jeton) {
  return jwt.verify(jeton, SECRET);
}

// Refuse toute requête sans jeton valide
export function exigerConnexion(req, res, next) {
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

// Réservé aux administratrices
export function exigerAdmin(req, res, next) {
  if (req.utilisateur?.role !== 'admin') return res.status(403).json({ erreur: 'Réservé aux administratrices' });
  next();
}
