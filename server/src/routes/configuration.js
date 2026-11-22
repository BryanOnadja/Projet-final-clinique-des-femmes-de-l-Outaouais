// Notes rapides, services et comptes de l'équipe.
// Tout le monde peut lire ; seule une administratrice peut modifier.
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { exigerAdmin } = require('../auth');
const { diffuser } = require('../temps-reel');

const STATUTS = ['nouveau', 'en_cours', 'en_attente', 'regle'];
const nettoyer = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

// ---------- Notes rapides ----------
const notes = express.Router();

// GET /api/notes-rapides (?tous=1 pour voir aussi les notes désactivées)
notes.get('/', async (req, res, next) => {
  try {
    const tous = req.query.tous === '1' && req.utilisateur.role === 'admin';
    const [lignes] = await db.query(
      `SELECT * FROM notes_rapides ${tous ? '' : 'WHERE actif = 1'} ORDER BY ordre, id`
    );
    res.json(lignes);
  } catch (err) {
    next(err);
  }
});

notes.post('/', exigerAdmin, async (req, res, next) => {
  try {
    const texte = nettoyer(req.body.texte);
    if (!texte) return res.status(400).json({ erreur: 'Le texte est obligatoire' });
    const statut = STATUTS.includes(req.body.statut_resultant) ? req.body.statut_resultant : null;
    const [[{ max }]] = await db.query('SELECT COALESCE(MAX(ordre), 0) AS max FROM notes_rapides');
    const [r] = await db.query(
      'INSERT INTO notes_rapides (texte, statut_resultant, ordre) VALUES (?, ?, ?)',
      [texte, statut, max + 1]
    );
    diffuser('configuration:modifiee', {});
    res.status(201).json({ id: r.insertId });
  } catch (err) {
    next(err);
  }
});

notes.patch('/:id', exigerAdmin, async (req, res, next) => {
  try {
    const c = {};
    if ('texte' in req.body) {
      c.texte = nettoyer(req.body.texte);
      if (!c.texte) return res.status(400).json({ erreur: 'Le texte est obligatoire' });
    }
    if ('statut_resultant' in req.body) c.statut_resultant = STATUTS.includes(req.body.statut_resultant) ? req.body.statut_resultant : null;
    if ('ordre' in req.body) c.ordre = Number(req.body.ordre) || 0;
    if ('actif' in req.body) c.actif = req.body.actif ? 1 : 0;
    if (Object.keys(c).length) await db.query('UPDATE notes_rapides SET ? WHERE id = ?', [c, req.params.id]);
    diffuser('configuration:modifiee', {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Services ----------
const services = express.Router();

services.get('/', async (req, res, next) => {
  try {
    const [lignes] = await db.query('SELECT * FROM services ORDER BY nom');
    res.json(lignes);
  } catch (err) {
    next(err);
  }
});

services.post('/', exigerAdmin, async (req, res, next) => {
  try {
    const nom = nettoyer(req.body.nom);
    if (!nom) return res.status(400).json({ erreur: 'Le nom est obligatoire' });
    const couleur = /^#[0-9a-f]{6}$/i.test(req.body.couleur) ? req.body.couleur : '#3e8ed0';
    const [r] = await db.query('INSERT INTO services (nom, couleur) VALUES (?, ?)', [nom, couleur]);
    diffuser('configuration:modifiee', {});
    res.status(201).json({ id: r.insertId });
  } catch (err) {
    next(err);
  }
});

services.patch('/:id', exigerAdmin, async (req, res, next) => {
  try {
    const c = {};
    if ('nom' in req.body) {
      c.nom = nettoyer(req.body.nom);
      if (!c.nom) return res.status(400).json({ erreur: 'Le nom est obligatoire' });
    }
    if ('couleur' in req.body && /^#[0-9a-f]{6}$/i.test(req.body.couleur)) c.couleur = req.body.couleur;
    if (Object.keys(c).length) await db.query('UPDATE services SET ? WHERE id = ?', [c, req.params.id]);
    diffuser('configuration:modifiee', {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Comptes de l'équipe (admin seulement) ----------
const utilisateurs = express.Router();
utilisateurs.use(exigerAdmin);

utilisateurs.get('/', async (req, res, next) => {
  try {
    const [lignes] = await db.query('SELECT id, nom, courriel, role, actif, cree_le FROM utilisateurs ORDER BY nom');
    res.json(lignes);
  } catch (err) {
    next(err);
  }
});

utilisateurs.post('/', async (req, res, next) => {
  try {
    const nom = nettoyer(req.body.nom);
    const courriel = nettoyer(req.body.courriel)?.toLowerCase();
    const motDePasse = req.body.mot_de_passe || '';
    if (!nom || !courriel) return res.status(400).json({ erreur: 'Nom et courriel obligatoires' });
    if (motDePasse.length < 8) return res.status(400).json({ erreur: 'Mot de passe : 8 caractères minimum' });
    const role = req.body.role === 'admin' ? 'admin' : 'membre';
    const hash = await bcrypt.hash(motDePasse, 10);
    const [r] = await db.query(
      'INSERT INTO utilisateurs (nom, courriel, mot_de_passe_hash, role) VALUES (?, ?, ?, ?)',
      [nom, courriel, hash, role]
    );
    res.status(201).json({ id: r.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ erreur: 'Ce courriel est déjà utilisé' });
    next(err);
  }
});

utilisateurs.patch('/:id', async (req, res, next) => {
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
    if (Object.keys(c).length) await db.query('UPDATE utilisateurs SET ? WHERE id = ?', [c, id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = { notes, services, utilisateurs };
