// Qui est connectée + connexion temps réel (Socket.io), partagés dans toute l'app.
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { api } from './api'

const AuthContext = createContext(null)
const INACTIVITE_MAX = 30 * 60 * 1000 // déconnexion après 30 minutes sans activité

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    const texte = sessionStorage.getItem('utilisateur')
    return texte ? JSON.parse(texte) : null
  })
  const [socket, setSocket] = useState(null)
  const [enDirect, setEnDirect] = useState(false)
  const minuterie = useRef(null)

  async function connexion(courriel, motDePasse) {
    const { jeton, utilisateur } = await api('/auth/login', {
      methode: 'POST',
      corps: { courriel, mot_de_passe: motDePasse },
    })
    sessionStorage.setItem('jeton', jeton)
    sessionStorage.setItem('utilisateur', JSON.stringify(utilisateur))
    setUtilisateur(utilisateur)
  }

  function deconnexion() {
    sessionStorage.clear()
    setUtilisateur(null)
  }

  // Ouvre la connexion temps réel quand quelqu'un est connecté
  useEffect(() => {
    if (!utilisateur) return
    const s = io({ auth: { jeton: sessionStorage.getItem('jeton') } })
    s.on('connect', () => setEnDirect(true))
    s.on('disconnect', () => setEnDirect(false))
    s.on('connect_error', () => setEnDirect(false))
    setSocket(s)
    return () => {
      s.disconnect()
      setSocket(null)
      setEnDirect(false)
    }
  }, [utilisateur])

  // Déconnexion automatique après une période d'inactivité
  useEffect(() => {
    if (!utilisateur) return
    const relancer = () => {
      clearTimeout(minuterie.current)
      minuterie.current = setTimeout(deconnexion, INACTIVITE_MAX)
    }
    const evenements = ['mousemove', 'keydown', 'click', 'touchstart']
    evenements.forEach((e) => window.addEventListener(e, relancer))
    relancer()
    return () => {
      clearTimeout(minuterie.current)
      evenements.forEach((e) => window.removeEventListener(e, relancer))
    }
  }, [utilisateur])

  return (
    <AuthContext.Provider value={{ utilisateur, connexion, deconnexion, socket, enDirect }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// Écoute un ou plusieurs événements temps réel tant que le composant est affiché
export function useEvenement(noms, gestionnaire) {
  const { socket } = useAuth()
  const ref = useRef(gestionnaire)
  ref.current = gestionnaire

  useEffect(() => {
    if (!socket) return
    const liste = Array.isArray(noms) ? noms : [noms]
    const ecouteurs = liste.map((nom) => {
      const f = (donnees) => ref.current(donnees, nom)
      socket.on(nom, f)
      return [nom, f]
    })
    return () => ecouteurs.forEach(([nom, f]) => socket.off(nom, f))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, JSON.stringify(noms)])
}
