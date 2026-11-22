// Connexion à MySQL : un « pool » réutilise les connexions entre les requêtes.
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinique_appels',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'local',
});

module.exports = pool;
