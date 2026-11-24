// Hooks pour le temps réel et la déconnexion automatique.
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { lireJeton } from '../services/api'
import { connecterSocket, deconnecterSocket, ecouter } from '../services/socket'
import { deconnexion, enDirectChange } from '../store/authSlice'

// Ouvre la connexion temps réel tant que quelqu'un est connecté
export function useConnexionTempsReel() {
  const dispatch = useDispatch()
  const utilisateur = useSelector((state) => state.auth.utilisateur)

  useEffect(() => {
    if (!utilisateur) return
    connecterSocket(lireJeton(), {
      onConnecte: () => dispatch(enDirectChange(true)),
      onDeconnecte: () => dispatch(enDirectChange(false)),
    })
    return () => {
      deconnecterSocket()
      dispatch(enDirectChange(false))
    }
  }, [utilisateur, dispatch])
}

// Écoute un ou plusieurs événements du serveur tant que le composant est affiché
export function useEvenement(noms, gestionnaire) {
  const ref = useRef(gestionnaire)
  useEffect(() => {
    ref.current = gestionnaire
  })
  const cle = [].concat(noms).join(',')

  useEffect(() => {
    const arrets = cle.split(',').map((nom) => ecouter(nom, (donnees) => ref.current(donnees, nom)))
    return () => arrets.forEach((arreter) => arreter())
  }, [cle])
}

const INACTIVITE_MAX = 30 * 60 * 1000 // 30 minutes

// Déconnexion automatique après une période d'inactivité
export function useDeconnexionInactivite() {
  const dispatch = useDispatch()
  const utilisateur = useSelector((state) => state.auth.utilisateur)

  useEffect(() => {
    if (!utilisateur) return
    let minuterie
    const relancer = () => {
      clearTimeout(minuterie)
      minuterie = setTimeout(() => dispatch(deconnexion()), INACTIVITE_MAX)
    }
    const evenements = ['mousemove', 'keydown', 'click', 'touchstart']
    evenements.forEach((e) => window.addEventListener(e, relancer))
    relancer()
    return () => {
      clearTimeout(minuterie)
      evenements.forEach((e) => window.removeEventListener(e, relancer))
    }
  }, [utilisateur, dispatch])
}
