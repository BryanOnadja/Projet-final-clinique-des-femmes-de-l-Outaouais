// Contrôleur : notes rapides, services et comptes de l'équipe.
// Tout le monde peut lire les notes et les services ; seule une administratrice peut modifier.
import bcrypt from 'bcryptjs';
import * as NoteRapide from '../models/NoteRapideModel.js';
import * as Service from '../models/ServiceModel.js';
import * as Utilisateur from '../models/UtilisateurModel.js';
import { STATUTS } from '../models/AppelModel.js';
import { diffuser } from '../socket/tempsReel.js';

const nettoyer = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const couleurValide = (c) => /^#[0-9a-f]{6}$/i.test(c);

// ---------- Notes rapides ----------

// GET /api/notes-rapides (?tous=1 pour voir aussi les notes désactivées, admin seulement)
export async function getNotesRapides(req, res, next) {
  try {
    const tous = req.query.tous === '1' && req.utilisateur.role === 'admin';
    res.json(await NoteRapide.listerNotesRapides({ tous }));
  } catch (err) {
    next(err);
  }
}

export async function createNoteRapide(req, res, next) {
  try {
    const texte = nettoyer(req.body.texte);
    if (!texte) return res.status(400).json({ erreur: 'Le texte est obligatoire' });
    const statut = STATUTS.includes(req.body.statut_resultant) ? req.body.statut_resultant : null;
    const id = await NoteRapide.creerNoteRapide({ texte, statut_resultant: statut });
    diffuser('configuration:modifiee', {});
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

export async function updateNoteRapide(req, res, next) {
  try {
    const c = {};
    if ('texte' in req.body) {
      c.texte = nettoyer(req.body.texte);
      if (!c.texte) return res.status(400).json({ erreur: 'Le texte est obligatoire' });
    }
    if ('statut_resultant' in req.body) c.statut_resultant = STATUTS.includes(req.body.statut_resultant) ? req.body.statut_resultant : null;
    if ('ordre' in req.body) c.ordre = Number(req.body.ordre) || 0;
    if ('actif' in req.body) c.actif = req.body.actif ? 1 : 0;
    if (Object.keys(c).length && !(await NoteRapide.modifierNoteRapide(req.params.id, c))) {
      return res.status(404).json({ erreur: 'Note rapide introuvable' });
    }
    diffuser('configuration:modifiee', {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ---------- Services ----------

export async function getServices(req, res, next) {
  try {
    res.json(await Service.listerServices());
  } catch (err) {
    next(err);
  }
}

export async function createService(req, res, next) {
  try {
    const nom = nettoyer(req.body.nom);
    if (!nom) return res.status(400).json({ erreur: 'Le nom est obligatoire' });
    const couleur = couleurValide(req.body.couleur) ? req.body.couleur : '#3e8ed0';
    const id = await Service.creerService({ nom, couleur });
    diffuser('configuration:modifiee', {});
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

export async function updateService(req, res, next) {
  try {
    const c = {};
    if ('nom' in req.body) {
      c.nom = nettoyer(req.body.nom);
      if (!c.nom) return res.status(400).json({ erreur: 'Le nom est obligatoire' });
    }
    if ('couleur' in req.body && couleurValide(req.body.couleur)) c.couleur = req.body.couleur;
    if (Object.keys(c).length && !(await Service.modifierService(req.params.id, c))) {
      return res.status(404).json({ erreur: 'Service introuvable' });
    }
    diffuser('configuration:modifiee', {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// ---------- Comptes de l'équipe (admin seulement) ----------

export async function getUtilisateurs(req, res, next) {
  try {
    res.json(await Utilisateur.listerUtilisateurs());
  } catch (err) {
    next(err);
  }
}

export async function createUtilisateur(req, res, next) {
  try {
    const nom = nettoyer(req.body.nom);
    const courriel = nettoyer(req.body.courriel)?.toLowerCase();
    const motDePasse = req.body.mot_de_passe || '';
    if (!nom || !courriel) return res.status(400).json({ erreur: 'Nom et courriel obligatoires' });
    if (motDePasse.length < 8) return res.status(400).json({ erreur: 'Mot de passe : 8 caractères minimum' });
    const id = await Utilisateur.creerUtilisateur({
      nom,
      courriel,
      mot_de_passe_hash: await bcrypt.hash(motDePasse, 10), // jamais le mot de passe en clair
      role: req.body.role === 'admin' ? 'admin' : 'membre',
    });
    res.status(201).json({ id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ erreur: 'Ce courriel est déjà utilisé' });
    next(err);
  }
}

export async function updateUtilisateur(req, res, next) {
  try {
    const id = Number(req.params.id);
    const c = {};
    if ('nom' in req.body && nettoyer(req.body.nom)) c.nom = nettoyer(req.body.nom);
    if ('role' in req.body) c.role = req.body.role === 'admin' ? 'admin' : 'membre';
    if ('actif' in req.body) c.actif = req.body.actif ? 1 : 0;
    if (req.body.mot_de_passe) {
      if (req.body.mot_de_passe.length < 8) return res.status(400).json({ erreur: 'Mot de passe : 8 caractères minimum' });
      c.mot_de_passe_hash = await bcrypt.hash(req.body.mot_de_passe, 10);
    }
    // On évite qu'une admin se bloque elle-même
    if (id === req.utilisateur.id && (c.actif === 0 || c.role === 'membre')) {
      return res.status(400).json({ erreur: 'Vous ne pouvez pas retirer vos propres droits' });
    }
    if (Object.keys(c).length && !(await Utilisateur.modifierUtilisateur(id, c))) {
      return res.status(404).json({ erreur: 'Compte introuvable' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
