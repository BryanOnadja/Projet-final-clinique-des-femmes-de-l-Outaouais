// Connexion à MySQL : un « pool » réutilise les connexions entre les requêtes.
const mysql = require('mysql2/promise');
const { configurationMySQL } = require('./config-mysql');

const pool = mysql.createPool({
  ...configurationMySQL(),
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'local',
});

module.exports = pool;
