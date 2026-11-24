// Modèle : les services de la clinique (filtres et couleurs).
import db from '../config/Database.js';

export async function listerServices() {
  const [lignes] = await db.query('SELECT * FROM services ORDER BY nom');
  return lignes;
}

export async function creerService({ nom, couleur }) {
  const [resultat] = await db.query('INSERT INTO services (nom, couleur) VALUES (?, ?)', [nom, couleur]);
  return resultat.insertId;
}

export async function modifierService(id, champs) {
  const [resultat] = await db.query('UPDATE services SET ? WHERE id = ?', [champs, id]);
  return resultat.affectedRows;
}
