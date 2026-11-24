// Connexion à MySQL avec mysql2 (comme au labo 1, mais en SQL direct).
import mysql from 'mysql2/promise';

// En local : variables DB_... de backend/.env (XAMPP).
// En ligne : adresse complète MYSQL_URL fournie par l'hébergeur.
export function configurationMySQL({ avecBase = true } = {}) {
  const url = process.env.MYSQL_URL || process.env.DATABASE_URL;
  if (url) return { uri: url };
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    ...(avecBase ? { database: process.env.DB_NAME || 'clinique_appels' } : {}),
  };
}

// Un « pool » réutilise les connexions entre les requêtes
const db = mysql.createPool({
  ...configurationMySQL(),
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'local',
});

export default db;
