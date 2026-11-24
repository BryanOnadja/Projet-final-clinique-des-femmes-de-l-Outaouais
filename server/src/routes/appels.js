// Routes des appels et de leur historique (actions).
const express = require('express');
const db = require('../db');
const { diffuser } = require('../temps-reel');

const router = express.Router();

const SOURCES = ['boite_1', 'boite_2', 'boite_3', 'boite_4', 'reception'];
const LANGUES = ['fr', 'en', 'es'];
const STATUTS = ['nouveau', 'en_cours', 'en_attente', 'regle'];
const LIBELLES_STATUT = { nouveau: 'Nouveau', en_cours: 'En cours', en_attente: 'En attente', regle: 'Réglé' };

// Un appel avec le nom du service, de qui s'en occupe et la dernière action
const SELECT_APPEL = `
  SELECT a.*,
         s.nom AS service_nom, s.couleur AS service_couleur,
         pc.nom AS pris_en_charge_nom,
         cp.nom AS cree_par_nom,
         (SELECT ac.texte FROM actions ac WHERE ac.appel_id = a.id ORDER BY ac.cree_le DESC, ac.id DESC LIMIT 1) AS derniere_action
  FROM appels a
  LEFT JOIN services s ON s.id = a.service_id
  LEFT JOIN utilisateurs pc ON pc.id = a.pris_en_charge_par
  LEFT JOIN utilisateurs cp ON cp.id = a.cree_par`;

async function chargerAppel(id) {
  const [lignes] = await db.query(`${SELECT_APPEL} WHERE a.id = ?`, [id]);
  return lignes[0] || null;
}

async function chargerActions(appelId) {
  const [lignes] = await db.query(
    `SELECT ac.*, u.nom AS utilisateur_nom
     FROM actions ac JOIN utilisateurs u ON u.id = ac.utilisateur_id
     WHERE ac.appel_id = ? ORDER BY ac.cree_le DESC, ac.id DESC`,
    [appelId]
  );
  return lignes;
}

async function ajouterAction(appelId, utilisateurId, texte, noteRapideId = null) {
  // L'heure vient de Node (et non de MySQL) pour rester cohérente avec recu_le
  await db.query(
    'INSERT INTO actions (appel_id, utilisateur_id, note_rapide_id, texte, cree_le) VALUES (?, ?, ?, ?, ?)',
    [appelId, utilisateurId, noteRapideId, texte, new Date()]
  );
}

// Date envoyée par le navigateur (format ISO, avec son fuseau horaire) -> objet Date.
// Ainsi l'heure reste juste même si le serveur est dans un autre fuseau (ex. en ligne).
function versDate(valeur) {
  if (!valeur) return null;
  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? null : date;
}

const nettoyer = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

// Après chaque changement : tous les écrans reçoivent l'appel à jour
async function annoncer(evenement, appelId) {
  const appel = await chargerAppel(appelId);
  diffuser(evenement, { appel });
  return appel;
}

// GET /api/appels?statut=&service=&langue=&archive=0|1|tous&q=
router.get('/', async (req, res, next) => {
  try {
    const { statut, service, langue, archive = '0', q } = req.query;
    const conditions = [];
    const valeurs = [];

    if (archive !== 'tous') {
      conditions.push('a.archive = ?');
      valeurs.push(archive === '1' ? 1 : 0);
    }
    if (STATUTS.includes(statut)) {
      conditions.push('a.statut = ?');
      valeurs.push(statut);
    }
    if (service) {
      conditions.push('a.service_id = ?');
      valeurs.push(Number(service));
    }
    if (LANGUES.includes(langue)) {
      conditions.push('a.langue = ?');
      valeurs.push(langue);
    }
    if (q && q.trim()) {
      // Recherche par numéro (on compare seulement les chiffres) ou par nom
      const chiffres = q.replace(/\D/g, '');
      if (chiffres.length >= 3) {
        conditions.push('a.telephone_chiffres LIKE ?');
        valeurs.push(`%${chiffres}%`);
      } else {
        conditions.push('a.nom_appelant LIKE ?');
        valeurs.push(`%${q.trim()}%`);
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [lignes] = await db.query(`${SELECT_APPEL} ${where} ORDER BY a.recu_le DESC LIMIT 500`, valeurs);
    res.json(lignes);
  } catch (err) {
    next(err);
  }
});

// GET /api/appels/:id : la fiche + tout l'historique
router.get('/:id', async (req, res, next) => {
  try {
    const appel = await chargerAppel(req.params.id);
    if (!appel) return res.status(404).json({ erreur: 'Appel introuvable' });
    res.json({ appel, actions: await chargerActions(appel.id) });
  } catch (err) {
    next(err);
  }
});

// POST /api/appels : créer une fiche (message vocal ou appel pris à la réception)
router.post('/', async (req, res, next) => {
  try {
    const b = req.body;
    if (!SOURCES.includes(b.source)) return res.status(400).json({ erreur: 'Source invalide' });
    if (!nettoyer(b.telephone)) return res.status(400).json({ erreur: 'Le numéro de téléphone est obligatoire' });
    const langue = LANGUES.includes(b.langue) ? b.langue : 'fr';

    const [r] = await db.query(
      `INSERT INTO appels (source, nom_appelant, telephone, telephone_chiffres, courriel, motif, langue,
        confidentiel, consigne_confidentialite, service_id, transcription, recu_le, cree_par)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.source,
        nettoyer(b.nom_appelant),
        b.telephone.trim(),
        b.telephone.replace(/\D/g, ''),
        nettoyer(b.courriel),
        nettoyer(b.motif),
        langue,
        b.confidentiel ? 1 : 0,
        b.confidentiel ? nettoyer(b.consigne_confidentialite) : null,
        b.service_id ? Number(b.service_id) : null,
        nettoyer(b.transcription),
        versDate(b.recu_le) || new Date(),
        req.utilisateur.id,
      ]
    );

    const origine = b.source === 'reception' ? 'appel pris à la réception' : 'message vocal';
    await ajouterAction(r.insertId, req.utilisateur.id, `Fiche créée (${origine})`);
    const appel = await annoncer('appel:cree', r.insertId);
    res.status(201).json(appel);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/appels/:id : statut, service, prise en charge, archive ou informations
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const avant = await chargerAppel(id);
    if (!avant) return res.status(404).json({ erreur: 'Appel introuvable' });

    const b = req.body;
    const moi = req.utilisateur;
    const changements = {};
    const actions = [];

    // Prise en charge : "moi" pour la prendre, null pour la libérer
    if ('prise_en_charge' in b) {
      if (b.prise_en_charge === 'moi') {
        changements.pris_en_charge_par = moi.id;
        if (avant.statut === 'nouveau') changements.statut = 'en_cours';
        actions.push(`${moi.nom} s'occupe de cet appel`);
      } else {
        changements.pris_en_charge_par = null;
        actions.push(`${moi.nom} a libéré l'appel`);
      }
    }

    if ('statut' in b && STATUTS.includes(b.statut) && b.statut !== avant.statut) {
      changements.statut = b.statut;
      actions.push(`Statut changé : ${LIBELLES_STATUT[b.statut]}`);
      if (b.statut === 'regle') {
        changements.archive = 1; // un appel réglé part aux archives
        actions.push('Appel archivé');
      }
    }

    if ('archive' in b && !('archive' in changements)) {
      const archive = b.archive ? 1 : 0;
      if (archive !== avant.archive) {
        changements.archive = archive;
        actions.push(archive ? 'Appel archivé' : 'Appel sorti des archives');
      }
    }

    if ('service_id' in b) {
      changements.service_id = b.service_id ? Number(b.service_id) : null;
      actions.push('Service modifié');
    }

    // Correction des informations de la fiche
    const champsInfos = ['nom_appelant', 'telephone', 'courriel', 'motif', 'langue', 'confidentiel', 'consigne_confidentialite'];
    if (champsInfos.some((c) => c in b)) {
      if ('nom_appelant' in b) changements.nom_appelant = nettoyer(b.nom_appelant);
      if ('telephone' in b && nettoyer(b.telephone)) {
        changements.telephone = b.telephone.trim();
        changements.telephone_chiffres = b.telephone.replace(/\D/g, '');
      }
      if ('courriel' in b) changements.courriel = nettoyer(b.courriel);
      if ('motif' in b) changements.motif = nettoyer(b.motif);
      if ('langue' in b && LANGUES.includes(b.langue)) changements.langue = b.langue;
      if ('confidentiel' in b) changements.confidentiel = b.confidentiel ? 1 : 0;
      if ('consigne_confidentialite' in b) changements.consigne_confidentialite = nettoyer(b.consigne_confidentialite);
      actions.push('Informations de la fiche modifiées');
    }

    if (Object.keys(changements).length === 0) return res.json(avant);

    // UPDATE appels SET champ1 = ?, champ2 = ? WHERE id = ?  (requête paramétrée)
    await db.query('UPDATE appels SET ? WHERE id = ?', [changements, id]);
    for (const texte of actions) await ajouterAction(id, moi.id, texte);

    res.json(await annoncer('appel:modifie', id));
  } catch (err) {
    next(err);
  }
});

// POST /api/appels/:id/actions  { note_rapide_id?, texte? }
// Note rapide (+ complément facultatif) ou note libre
router.post('/:id/actions', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const appel = await chargerAppel(id);
    if (!appel) return res.status(404).json({ erreur: 'Appel introuvable' });

    const moi = req.utilisateur;
    const complement = nettoyer(req.body.texte);
    let texte = complement;
    let note = null;

    if (req.body.note_rapide_id) {
      const [lignes] = await db.query('SELECT * FROM notes_rapides WHERE id = ?', [req.body.note_rapide_id]);
      note = lignes[0];
      if (!note) return res.status(400).json({ erreur: 'Note rapide introuvable' });
      texte = complement ? `${note.texte} ${complement}` : note.texte;
    }
    if (!texte) return res.status(400).json({ erreur: 'La note est vide' });

    await ajouterAction(id, moi.id, texte, note ? note.id : null);

    // Une note rapide peut changer le statut de l'appel
    if (note?.statut_resultant && note.statut_resultant !== appel.statut) {
      const changements = { statut: note.statut_resultant };
      if (!appel.pris_en_charge_par) changements.pris_en_charge_par = moi.id;
      if (note.statut_resultant === 'regle') changements.archive = 1;
      await db.query('UPDATE appels SET ? WHERE id = ?', [changements, id]);
      await ajouterAction(id, moi.id, `Statut changé : ${LIBELLES_STATUT[note.statut_resultant]}`);
      if (changements.archive) await ajouterAction(id, moi.id, 'Appel archivé');
    }

    const appelAJour = await annoncer('appel:modifie', id);
    res.status(201).json({ appel: appelAJour, actions: await chargerActions(id) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
