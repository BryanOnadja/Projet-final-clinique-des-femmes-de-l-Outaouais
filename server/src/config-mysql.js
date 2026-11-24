// Paramètres de connexion à MySQL.
// En local : les variables DB_... de server/.env (XAMPP).
// En ligne (Railway) : l'adresse complète MYSQL_URL fournie par l'hébergeur.
function configurationMySQL({ avecBase = true } = {}) {
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

module.exports = { configurationMySQL };
