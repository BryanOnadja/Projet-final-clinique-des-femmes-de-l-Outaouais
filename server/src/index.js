// Point d'entrée du serveur : Express (API REST) + Socket.io (temps réel).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const cors = require('cors');

const db = require('./db');
const { router: routesAuth, exigerConnexion } = require('./auth');
const routesAppels = require('./routes/appels');
const { notes, services, utilisateurs } = require('./routes/configuration');
const { demarrerTempsReel } = require('./temps-reel');

const PORT = Number(process.env.PORT || 4000);
const ORIGINE_CLIENT = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: ORIGINE_CLIENT }));
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

// Routes : la connexion est publique, tout le reste exige d'être connectée
app.use('/api/auth', routesAuth);
app.use('/api/appels', exigerConnexion, routesAppels);
app.use('/api/notes-rapides', exigerConnexion, notes);
app.use('/api/services', exigerConnexion, services);
app.use('/api/utilisateurs', exigerConnexion, utilisateurs);

app.use('/api', (req, res) => res.status(404).json({ erreur: 'Route inconnue' }));

// En production : le serveur sert aussi le site React compilé (npm run build)
const dossierClient = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(dossierClient)) {
  app.use(express.static(dossierClient));
  app.get('*', (req, res) => res.sendFile(path.join(dossierClient, 'index.html')));
}

// Gestion des erreurs : on journalise, sans montrer les détails techniques
app.use((err, req, res, next) => {
  console.error('Erreur :', err);
  res.status(500).json({ erreur: 'Erreur du serveur' });
});

const serveur = http.createServer(app);
demarrerTempsReel(serveur, ORIGINE_CLIENT);

serveur.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
