import { api } from './api'

// POST /api/auth/login -> { jeton, utilisateur }
const connexion = (courriel, motDePasse) =>
  api.post('/auth/login', { courriel, mot_de_passe: motDePasse }).then((r) => r.data)

export default { connexion }
