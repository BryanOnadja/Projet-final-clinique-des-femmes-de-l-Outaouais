// Point d'entrée du back-end : Express (API REST) + Socket.io (temps réel).
import './config/env.js'; // en premier : charge backend/.env
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

import db from './config/Database.js';
import AuthRoutes from './routes/AuthRoutes.js';
import AppelRoutes from './routes/AppelRoutes.js';
import ConfigurationRoutes from './routes/ConfigurationRoutes.js';
import { demarrerTempsReel } from './socket/tempsReel.js';
import { creerBaseDemo } from './db/seed.js';

const PORT = Number(process.env.PORT || 4000);
const ORIGINE_FRONTEND = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: ORIGINE_FRONTEND }));
app.use(express.json({ limit: '1mb' }));

// Vérifie que le serveur et la base répondent
app.get('/api/sante', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ serveur: 'ok', base: 'ok' });
  } catch {
    res.status(500).json({ serveur: 'ok', base: 'injoignable' });
  }
});

app.use(AuthRoutes);
app.use(AppelRoutes);
app.use(ConfigurationRoutes);

app.use('/api', (req, res) => res.status(404).json({ erreur: 'Route inconnue' }));

// En production : le back-end sert aussi le front-end compilé (npm run build)
const dossierFrontend = fileURLToPath(new URL('../frontend/dist', import.meta.url));
if (fs.existsSync(dossierFrontend)) {
  app.use(express.static(dossierFrontend));
  app.get('*', (req, res) => res.sendFile(`${dossierFrontend}/index.html`));
}

// Gestion des erreurs : on journalise, sans montrer les détails techniques
app.use((err, req, res, next) => {
  console.error('Erreur :', err);
  res.status(500).json({ erreur: 'Erreur du serveur' });
});

const serveur = http.createServer(app);
demarrerTempsReel(serveur, ORIGINE_FRONTEND);

// Base vide (premier démarrage en ligne) : on crée les tables et les données fictives
async function preparerBase() {
  const [tables] = await db.query("SHOW TABLES LIKE 'utilisateurs'");
  if (tables.length === 0) {
    console.log('Base vide : création des tables et des données fictives...');
    await creerBaseDemo();
  }
}

preparerBase()
  .then(() => serveur.listen(PORT, () => console.log(`✅ Back-end démarré sur http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Impossible de joindre la base de données :', err.message);
    console.error('Vérifiez que MySQL est démarré (XAMPP) et les valeurs de backend/.env');
    process.exit(1);
  });

export default app;
