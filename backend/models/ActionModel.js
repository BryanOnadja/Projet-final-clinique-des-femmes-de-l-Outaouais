// Modèle : l'historique d'un appel (table « actions »). Une action n'est jamais modifiée.
import db from '../config/Database.js';

export async function listerActions(appelId) {
  const [lignes] = await db.query(
    `SELECT ac.*, u.nom AS utilisateur_nom
     FROM actions ac JOIN utilisateurs u ON u.id = ac.utilisateur_id
     WHERE ac.appel_id = ? ORDER BY ac.cree_le DESC, ac.id DESC`,
    [appelId]
  );
  return lignes;
}

export async function ajouterAction(appelId, utilisateurId, texte, noteRapideId = null) {
  // L'heure vient de Node (et non de MySQL) pour rester cohérente avec recu_le
  await db.query(
    'INSERT INTO actions (appel_id, utilisateur_id, note_rapide_id, texte, cree_le) VALUES (?, ?, ?, ?, ?)',
    [appelId, utilisateurId, noteRapideId, texte, new Date()]
  );
}
