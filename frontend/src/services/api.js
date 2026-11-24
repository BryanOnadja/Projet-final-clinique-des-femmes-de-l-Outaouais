// Instance Axios partagée par tous les services (comme services/api.js du cours).
import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

export const lireJeton = () => sessionStorage.getItem('jeton')

// Ajoute le jeton de connexion à chaque requête
api.interceptors.request.use((config) => {
  const jeton = lireJeton()
  if (jeton) config.headers.Authorization = `Bearer ${jeton}`
  return config
})

// Erreurs : on garde le message du serveur ; session expirée -> retour à la connexion
api.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    const statut = erreur.response?.status
    if (statut === 401 && !erreur.config.url.includes('/auth/login')) {
      sessionStorage.removeItem('jeton')
      sessionStorage.removeItem('utilisateur')
      window.location.href = '/connexion'
    }
    return Promise.reject(new Error(erreur.response?.data?.erreur || 'Une erreur est survenue'))
  },
)
