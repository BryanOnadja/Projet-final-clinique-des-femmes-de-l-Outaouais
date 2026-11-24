// Modèle : toutes les requêtes SQL sur la table « appels ».
import db from '../config/Database.js';

export const SOURCES = ['boite_1', 'boite_2', 'boite_3', 'boite_4', 'reception'];
export const LANGUES = ['fr', 'en', 'es'];
export const STATUTS = ['nouveau', 'en_cours', 'en_attente', 'regle'];

// Un appel avec, grâce aux jointures, le nom du service, de qui s'en occupe et la dernière action
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

// filtres : { statut, service, langue, archive: '0' | '1' | 'tous', q }
export async function listerAppels({ statut, service, langue, archive = '0', q } = {}) {
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
  return lignes;
}

export async function trouverAppel(id) {
  const [lignes] = await db.query(`${SELECT_APPEL} WHERE a.id = ?`, [id]);
  return lignes[0] || null;
}

export async function creerAppel(appel) {
  const [resultat] = await db.query('INSERT INTO appels SET ?', [appel]);
  return resultat.insertId;
}

// champs : objet { colonne: valeur }  ->  UPDATE appels SET colonne = ? ... (requête paramétrée)
export async function modifierAppel(id, champs) {
  await db.query('UPDATE appels SET ? WHERE id = ?', [champs, id]);
}
