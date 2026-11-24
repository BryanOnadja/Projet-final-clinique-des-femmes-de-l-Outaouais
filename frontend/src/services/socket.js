// Connexion temps réel (Socket.io). Une seule connexion pour toute l'application.
import { io } from 'socket.io-client'

let socket = null
const ecouteurs = new Map() // nom d'événement -> fonctions à appeler

export function connecterSocket(jeton, { onConnecte, onDeconnecte } = {}) {
  deconnecterSocket()
  socket = io({ auth: { jeton } })
  socket.on('connect', () => onConnecte?.())
  socket.on('disconnect', () => onDeconnecte?.())
  socket.on('connect_error', () => onDeconnecte?.())
  // Chaque événement reçu du serveur est transmis aux composants qui l'écoutent
  socket.onAny((nom, donnees) => ecouteurs.get(nom)?.forEach((f) => f(donnees, nom)))
}

export function deconnecterSocket() {
  socket?.disconnect()
  socket = null
}

// Écouter un événement ; renvoie une fonction pour arrêter d'écouter
export function ecouter(nom, fonction) {
  if (!ecouteurs.has(nom)) ecouteurs.set(nom, new Set())
  ecouteurs.get(nom).add(fonction)
  return () => ecouteurs.get(nom).delete(fonction)
}
