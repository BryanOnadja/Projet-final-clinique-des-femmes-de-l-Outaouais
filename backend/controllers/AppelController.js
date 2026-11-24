// Contrôleur : règles de gestion des appels et de leur historique.
import * as Appel from '../models/AppelModel.js';
import * as Action from '../models/ActionModel.js';
import { trouverNoteRapide } from '../models/NoteRapideModel.js';
import { diffuser } from '../socket/tempsReel.js';

const LIBELLES_STATUT = { nouveau: 'Nouveau', en_cours: 'En cours', en_attente: 'En attente', regle: 'Réglé' };

const nettoyer = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

// Date envoyée par le navigateur (format ISO, avec son fuseau horaire) -> objet Date.
// Ainsi l'heure reste juste même si le serveur est dans un autre fuseau (ex. en ligne).
function versDate(valeur) {
  if (!valeur) return null;
  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Après chaque changement : tous les écrans reçoivent l'appel à jour (temps réel)
async function annoncer(evenement, appelId) {
  const appel = await Appel.trouverAppel(appelId);
  diffuser(evenement, { appel });
  return appel;
}

// GET /api/appels?statut=&service=&langue=&archive=0|1|tous&q=
export async function getAppels(req, res, next) {
  try {
    res.json(await Appel.listerAppels(req.query));
  } catch (err) {
    next(err);
  }
}

// GET /api/appels/:id : la fiche + tout l'historique
export async function getAppel(req, res, next) {
  try {
    const appel = await Appel.trouverAppel(req.params.id);
    if (!appel) return res.status(404).json({ erreur: 'Appel introuvable' });
    res.json({ appel, actions: await Action.listerActions(appel.id) });
  } catch (err) {
    next(err);
  }
}

// POST /api/appels : créer une fiche (message vocal ou appel pris à la réception)
export async function createAppel(req, res, next) {
  try {
    const b = req.body;
    if (!Appel.SOURCES.includes(b.source)) return res.status(400).json({ erreur: 'Source invalide' });
    if (!nettoyer(b.telephone)) return res.status(400).json({ erreur: 'Le numéro de téléphone est obligatoire' });

    const id = await Appel.creerAppel({
      source: b.source,
      nom_appelant: nettoyer(b.nom_appelant),
      telephone: b.telephone.trim(),
      telephone_chiffres: b.telephone.replace(/\D/g, ''),
      courriel: nettoyer(b.courriel),
      motif: nettoyer(b.motif),
      langue: Appel.LANGUES.includes(b.langue) ? b.langue : 'fr',
      confidentiel: b.confidentiel ? 1 : 0,
      consigne_confidentialite: b.confidentiel ? nettoyer(b.consigne_confidentialite) : null,
      service_id: b.service_id ? Number(b.service_id) : null,
      transcription: nettoyer(b.transcription),
      recu_le: versDate(b.recu_le) || new Date(),
      cree_par: req.utilisateur.id,
    });

    const origine = b.source === 'reception' ? 'appel pris à la réception' : 'message vocal';
    await Action.ajouterAction(id, req.utilisateur.id, `Fiche créée (${origine})`);
    res.status(201).json(await annoncer('appel:cree', id));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/appels/:id : statut, service, prise en charge, archive ou informations
export async function updateAppel(req, res, next) {
  try {
    const id = Number(req.params.id);
    const avant = await Appel.trouverAppel(id);
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

    if ('statut' in b && Appel.STATUTS.includes(b.statut) && b.statut !== avant.statut) {
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
      if ('langue' in b && Appel.LANGUES.includes(b.langue)) changements.langue = b.langue;
      if ('confidentiel' in b) changements.confidentiel = b.confidentiel ? 1 : 0;
      if ('consigne_confidentialite' in b) changements.consigne_confidentialite = nettoyer(b.consigne_confidentialite);
      actions.push('Informations de la fiche modifiées');
    }

    if (Object.keys(changements).length === 0) return res.json(avant);

    await Appel.modifierAppel(id, changements);
    for (const texte of actions) await Action.ajouterAction(id, moi.id, texte);
    res.json(await annoncer('appel:modifie', id));
  } catch (err) {
    next(err);
  }
}

// POST /api/appels/:id/actions  { note_rapide_id?, texte? } : note rapide (+ complément) ou note libre
export async function addAction(req, res, next) {
  try {
    const id = Number(req.params.id);
    const appel = await Appel.trouverAppel(id);
    if (!appel) return res.status(404).json({ erreur: 'Appel introuvable' });

    const moi = req.utilisateur;
    const complement = nettoyer(req.body.texte);
    let texte = complement;
    let note = null;

    if (req.body.note_rapide_id) {
      note = await trouverNoteRapide(req.body.note_rapide_id);
      if (!note) return res.status(400).json({ erreur: 'Note rapide introuvable' });
      texte = complement ? `${note.texte} ${complement}` : note.texte;
    }
    if (!texte) return res.status(400).json({ erreur: 'La note est vide' });

    await Action.ajouterAction(id, moi.id, texte, note ? note.id : null);

    // Une note rapide peut changer le statut de l'appel
    if (note?.statut_resultant && note.statut_resultant !== appel.statut) {
      const changements = { statut: note.statut_resultant };
      if (!appel.pris_en_charge_par) changements.pris_en_charge_par = moi.id;
      if (note.statut_resultant === 'regle') changements.archive = 1;
      await Appel.modifierAppel(id, changements);
      await Action.ajouterAction(id, moi.id, `Statut changé : ${LIBELLES_STATUT[note.statut_resultant]}`);
      if (changements.archive) await Action.ajouterAction(id, moi.id, 'Appel archivé');
    }

    const appelAJour = await annoncer('appel:modifie', id);
    res.status(201).json({ appel: appelAJour, actions: await Action.listerActions(id) });
  } catch (err) {
    next(err);
  }
}
