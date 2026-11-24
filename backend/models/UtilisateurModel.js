// Modèle : les comptes de l'équipe. Le mot de passe n'est jamais renvoyé au front-end.
import db from '../config/Database.js';

export async function trouverParCourriel(courriel) {
  const [lignes] = await db.query('SELECT * FROM utilisateurs WHERE courriel = ? AND actif = 1', [courriel]);
  return lignes[0] || null;
}

export async function listerUtilisateurs() {
  const [lignes] = await db.query('SELECT id, nom, courriel, role, actif, cree_le FROM utilisateurs ORDER BY nom');
  return lignes;
}

export async function creerUtilisateur({ nom, courriel, mot_de_passe_hash, role }) {
  const [resultat] = await db.query(
    'INSERT INTO utilisateurs (nom, courriel, mot_de_passe_hash, role) VALUES (?, ?, ?, ?)',
    [nom, courriel, mot_de_passe_hash, role]
  );
  return resultat.insertId;
}

export async function modifierUtilisateur(id, champs) {
  const [resultat] = await db.query('UPDATE utilisateurs SET ? WHERE id = ?', [champs, id]);
  return resultat.affectedRows;
}
