// Modèle : les notes rapides (textes cliquables modifiables par l'administratrice).
import db from '../config/Database.js';

export async function listerNotesRapides({ tous = false } = {}) {
  const [lignes] = await db.query(`SELECT * FROM notes_rapides ${tous ? '' : 'WHERE actif = 1'} ORDER BY ordre, id`);
  return lignes;
}

export async function trouverNoteRapide(id) {
  const [lignes] = await db.query('SELECT * FROM notes_rapides WHERE id = ?', [id]);
  return lignes[0] || null;
}

export async function creerNoteRapide({ texte, statut_resultant }) {
  const [[{ max }]] = await db.query('SELECT COALESCE(MAX(ordre), 0) AS max FROM notes_rapides');
  const [resultat] = await db.query(
    'INSERT INTO notes_rapides (texte, statut_resultant, ordre) VALUES (?, ?, ?)',
    [texte, statut_resultant, max + 1]
  );
  return resultat.insertId;
}

export async function modifierNoteRapide(id, champs) {
  const [resultat] = await db.query('UPDATE notes_rapides SET ? WHERE id = ?', [champs, id]);
  return resultat.affectedRows;
}
