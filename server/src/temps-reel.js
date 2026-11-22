// Temps réel avec Socket.io : le serveur prévient tous les écrans ouverts
// dès qu'un appel est créé ou modifié. Plus besoin de rafraîchir la page.
const { Server } = require('socket.io');
const { verifierJeton } = require('./auth');

let io = null;

function demarrerTempsReel(serveurHttp, origineClient) {
  io = new Server(serveurHttp, { cors: { origin: origineClient } });

  // Seules les personnes connectées reçoivent les événements
  io.use((socket, next) => {
    try {
      socket.utilisateur = verifierJeton(socket.handshake.auth?.jeton);
      next();
    } catch {
      next(new Error('Connexion requise'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 ${socket.utilisateur.nom} est connectée en direct`);
    socket.on('disconnect', () => console.log(`🔌 ${socket.utilisateur.nom} s'est déconnectée`));
  });
}

// Envoie un événement à tous les écrans connectés
function diffuser(evenement, donnees) {
  if (io) io.emit(evenement, donnees);
}

module.exports = { demarrerTempsReel, diffuser };
