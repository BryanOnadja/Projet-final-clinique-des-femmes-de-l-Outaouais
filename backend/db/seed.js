// Crée la base de données, les tables et un jeu de DONNÉES FICTIVES.
// Usage : npm run db:init (depuis la racine) ou npm run seed (depuis backend/)
// ATTENTION : efface toutes les données existantes.
// En ligne, le serveur l'appelle tout seul au premier démarrage, quand la base est vide.

import '../config/env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { configurationMySQL } from '../config/Database.js';

const NOM_BASE = process.env.DB_NAME || 'clinique_appels';

// Petit générateur pseudo-aléatoire : mêmes données à chaque exécution
let graine = 42;
function hasard() {
  graine = (graine * 16807) % 2147483647;
  return (graine - 1) / 2147483646;
}
const choisir = (liste) => liste[Math.floor(hasard() * liste.length)];
const entre = (min, max) => min + Math.floor(hasard() * (max - min + 1));

// ---------- Données de départ ----------

const MOT_DE_PASSE_DEMO = 'Demo123!';

const UTILISATEURS = [
  { nom: 'Sophie Admin', courriel: 'admin@clinique.test', role: 'admin' },
  { nom: 'Julie Réception', courriel: 'reception@clinique.test', role: 'membre' },
  { nom: 'Marie Infirmière', courriel: 'infirmiere@clinique.test', role: 'membre' },
  { nom: 'Nadia Intervenante', courriel: 'intervenante@clinique.test', role: 'membre' },
];

const SERVICES = [
  { nom: 'Contraception', couleur: '#3e8ed0' },
  { nom: 'Interruption de grossesse', couleur: '#8e5bd0' },
  { nom: "Contraception d'urgence", couleur: '#e8762c' },
  { nom: 'Ateliers et sensibilisation', couleur: '#2f9e6e' },
  { nom: 'Soutien', couleur: '#d6457a' },
  { nom: 'Ménopause', couleur: '#1f9aa8' },
];

// Textes tirés du document de la clinique. statut = statut donné à l'appel.
const NOTES_RAPIDES = [
  { texte: "J'essaie de retourner l'appel", statut: 'en_cours' },
  { texte: 'Message laissé sur la boîte vocale de rappeler', statut: 'en_attente' },
  { texte: 'Cliente rejointe, nous rappellera quand elle sera disponible', statut: 'en_attente' },
  { texte: 'Cliente rejointe, rappeler aux alentours de :', statut: 'en_attente' },
  { texte: 'Cliente rejointe, doit être appelée par une infirmière', statut: 'en_attente' },
  { texte: 'Cliente rejointe, message transmis à une collègue qui gérera la suite', statut: 'regle' },
  { texte: 'Cliente rejointe', statut: 'regle' },
  { texte: 'Rendez-vous annulé', statut: 'regle' },
  { texte: 'Aucun suivi nécessaire', statut: 'regle' },
];

// Noms et numéros FICTIFS (les numéros 555-01xx sont réservés à la fiction)
const PRENOMS = ['Camille', 'Léa', 'Chloé', 'Emma', 'Sarah', 'Amélie', 'Jessica', 'Maria', 'Fatima', 'Ana', 'Laura', 'Kim', 'Olivia', 'Isabel', 'Noémie', 'Rosalie', 'Mégane', 'Aïcha', 'Lucia', 'Grace'];
const NOMS = ['Exemple', 'Fictif', 'Testeur', 'Demo', 'Modèle', 'Essai'];

const MOTIFS = [
  { service: 0, texte: 'Demande de rendez-vous pour une consultation en contraception' },
  { service: 0, texte: 'Question sur un renouvellement de contraception' },
  { service: 1, texte: "Demande d'information et de rendez-vous" },
  { service: 1, texte: 'Suivi après un rendez-vous' },
  { service: 2, texte: "Question urgente sur la contraception d'urgence" },
  { service: 3, texte: 'Inscription à un atelier' },
  { service: 4, texte: 'Demande de soutien, souhaite parler à une intervenante' },
  { service: 5, texte: 'Question sur les services pour la ménopause' },
  { service: 0, texte: 'Veut changer la date de son rendez-vous' },
];

const TRANSCRIPTIONS = {
  fr: (p, t) => `Bonjour, c'est ${p}. J'aimerais avoir un suivi concernant un rendez-vous. Vous pouvez me rappeler au ${t}. Merci.`,
  en: (p, t) => `Hi, this is ${p}. I'm calling about an appointment, could someone call me back? My number is ${t}. Thank you.`,
  es: (p, t) => `Hola, soy ${p}. Llamo por una cita, ¿me pueden devolver la llamada? Mi número es ${t}. Gracias.`,
};

const SOURCES = ['boite_1', 'boite_2', 'boite_3', 'boite_4', 'reception'];

function langueAuHasard() {
  const x = hasard();
  return x < 0.6 ? 'fr' : x < 0.9 ? 'en' : 'es';
}

function telephoneAuHasard() {
  return `819-555-01${String(entre(0, 99)).padStart(2, '0')}`;
}

function ilYa(jours, heure) {
  const d = new Date();
  d.setDate(d.getDate() - jours);
  d.setHours(heure, entre(0, 59), 0, 0);
  // Pas d'appel dans le futur : on le ramène un peu avant maintenant
  if (d > new Date()) return new Date(Date.now() - entre(10, 180) * 60000);
  return d;
}

function ajouterMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

// ---------- Exécution ----------

export async function creerBaseDemo() {
  const config = configurationMySQL({ avecBase: false });
  const connexion = await mysql.createConnection({ ...config, multipleStatements: true, timezone: 'local' });

  // En local, on crée la base si besoin. En ligne, l'hébergeur l'a déjà créée.
  if (!config.uri) {
    console.log(`Création de la base « ${NOM_BASE} »...`);
    await connexion.query(`CREATE DATABASE IF NOT EXISTS \`${NOM_BASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connexion.query(`USE \`${NOM_BASE}\``);
  }
  await connexion.query(fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));

  // Utilisateurs
  const hash = await bcrypt.hash(MOT_DE_PASSE_DEMO, 10);
  const idsUtilisateurs = [];
  for (const u of UTILISATEURS) {
    const [r] = await connexion.query(
      'INSERT INTO utilisateurs (nom, courriel, mot_de_passe_hash, role) VALUES (?, ?, ?, ?)',
      [u.nom, u.courriel, hash, u.role]
    );
    idsUtilisateurs.push(r.insertId);
  }
  const [, reception, infirmiere, intervenante] = idsUtilisateurs;
  const equipe = [reception, infirmiere, intervenante];

  // Services
  const idsServices = [];
  for (const s of SERVICES) {
    const [r] = await connexion.query('INSERT INTO services (nom, couleur) VALUES (?, ?)', [s.nom, s.couleur]);
    idsServices.push(r.insertId);
  }

  // Notes rapides
  const notes = [];
  for (const [i, n] of NOTES_RAPIDES.entries()) {
    const [r] = await connexion.query(
      'INSERT INTO notes_rapides (texte, statut_resultant, ordre) VALUES (?, ?, ?)',
      [n.texte, n.statut, i + 1]
    );
    notes.push({ id: r.insertId, ...n });
  }
  const note = (debut) => notes.find((n) => n.texte.startsWith(debut));

  // Fonction utilitaire pour créer un appel et son historique
  async function creerAppel({ joursAvant, heure, statut, archive, telephone, prenom }) {
    const langue = langueAuHasard();
    const motif = choisir(MOTIFS);
    const source = choisir(SOURCES);
    const tel = telephone || telephoneAuHasard();
    const p = prenom || choisir(PRENOMS);
    const nom = `${p} ${choisir(NOMS)}`;
    const confidentiel = hasard() < 0.25 ? 1 : 0;
    const recuLe = ilYa(joursAvant, heure);
    const creePar = reception;
    const transcription = source === 'reception' ? null : TRANSCRIPTIONS[langue](p, tel);

    let prisPar = null;
    if (statut === 'en_cours' || statut === 'en_attente' || statut === 'regle') prisPar = choisir([infirmiere, intervenante]);

    const [r] = await connexion.query(
      `INSERT INTO appels (source, nom_appelant, telephone, telephone_chiffres, courriel, motif, langue,
        confidentiel, consigne_confidentialite, service_id, statut, archive, transcription, recu_le, cree_par, pris_en_charge_par, cree_le)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        source, nom, tel, tel.replace(/\D/g, ''), null, motif.texte, langue,
        confidentiel, confidentiel ? 'Ne pas laisser de message. Appeler seulement en semaine.' : null,
        idsServices[motif.service], statut, archive, transcription, recuLe, creePar, prisPar, recuLe,
      ]
    );
    const appelId = r.insertId;

    // Historique cohérent avec le statut (enregistré à la fin de la fonction)
    let moment = ajouterMinutes(recuLe, entre(5, 30));
    const historique = [];
    const action = async (utilisateur, texte, noteId = null) => {
      historique.push({ utilisateur, texte, noteId, moment });
      moment = ajouterMinutes(moment, entre(20, 240));
    };

    await action(creePar, source === 'reception' ? 'Fiche créée (appel pris à la réception)' : 'Fiche créée à partir du message vocal');
    if (prisPar) {
      await action(prisPar, `${prisPar === infirmiere ? 'Marie Infirmière' : 'Nadia Intervenante'} s'occupe de cet appel`);
      await action(prisPar, note("J'essaie").texte, note("J'essaie").id);
    }
    if (statut === 'en_attente') {
      const n = choisir([note('Message laissé'), note('Cliente rejointe, nous rappellera'), note('Cliente rejointe, doit être')]);
      await action(prisPar, n.texte, n.id);
    }
    if (statut === 'regle') {
      if (hasard() < 0.5) await action(prisPar, note('Message laissé').texte, note('Message laissé').id);
      const n = choisir([note('Cliente rejointe'), note('Rendez-vous annulé'), note('Aucun suivi'), note('Cliente rejointe, message transmis')]);
      await action(prisPar, n.texte, n.id);
      await action(prisPar, 'Appel archivé');
    }

    // Aucune action dans le futur : on resserre l'historique des appels récents
    const maintenant = Date.now() - 60000;
    const dernier = historique[historique.length - 1].moment.getTime();
    const debut = recuLe.getTime();
    const echelle = dernier > maintenant ? (maintenant - debut) / (dernier - debut) : 1;
    for (const h of historique) {
      const quand = new Date(debut + (h.moment.getTime() - debut) * echelle);
      await connexion.query(
        'INSERT INTO actions (appel_id, utilisateur_id, note_rapide_id, texte, cree_le) VALUES (?, ?, ?, ?, ?)',
        [appelId, h.utilisateur, h.noteId, h.texte, quand]
      );
    }
  }

  // Appels actifs des 5 derniers jours
  const statutsActifs = ['nouveau', 'nouveau', 'nouveau', 'en_cours', 'en_attente', 'en_attente'];
  for (let i = 0; i < 24; i++) {
    await creerAppel({ joursAvant: entre(0, 5), heure: entre(8, 17), statut: choisir(statutsActifs), archive: 0 });
  }

  // Archives sur 18 mois, dont trois numéros qui reviennent (pour montrer la recherche)
  const habitues = [
    { telephone: '819-555-0142', prenom: 'Camille' },
    { telephone: '819-555-0177', prenom: 'Maria' },
    { telephone: '613-555-0109', prenom: 'Grace' },
  ];
  for (let i = 0; i < 20; i++) {
    await creerAppel({ joursAvant: entre(7, 540), heure: entre(8, 17), statut: 'regle', archive: 1 });
  }
  for (const h of habitues) {
    for (let i = 0; i < 3; i++) {
      await creerAppel({ joursAvant: entre(30, 500), heure: entre(8, 17), statut: 'regle', archive: 1, ...h });
    }
  }
  // Un appel actif pour chaque habituée : la recherche montre aussi ses anciens appels
  for (const h of habitues) {
    await creerAppel({ joursAvant: entre(0, 2), heure: entre(8, 17), statut: 'nouveau', archive: 0, ...h });
  }

  const [[{ total }]] = await connexion.query('SELECT COUNT(*) AS total FROM appels');
  console.log(`Terminé : ${total} appels fictifs créés.`);
  console.log(`Comptes de démo (mot de passe : ${MOT_DE_PASSE_DEMO}) :`);
  UTILISATEURS.forEach((u) => console.log(`  - ${u.courriel} (${u.role})`));
  await connexion.end();
}

// Lancé directement avec « npm run db:init »
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  creerBaseDemo().catch((err) => {
    console.error('Erreur pendant la création de la base :', err.message);
    console.error('Vérifiez que MySQL est démarré (XAMPP) et les valeurs de backend/.env');
    process.exit(1);
  });
}
