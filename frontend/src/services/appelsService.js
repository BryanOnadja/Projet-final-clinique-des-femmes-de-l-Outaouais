import { api } from './api'

// filtres : { statut, service, langue, archive, q } (les valeurs vides sont ignorées)
const lister = (filtres = {}) => {
  const params = Object.fromEntries(Object.entries(filtres).filter(([, v]) => v !== '' && v != null))
  return api.get('/appels', { params }).then((r) => r.data)
}

const obtenir = (id) => api.get(`/appels/${id}`).then((r) => r.data) // { appel, actions }

const creer = (appel) => api.post('/appels', appel).then((r) => r.data)

const modifier = (id, changements) => api.patch(`/appels/${id}`, changements).then((r) => r.data)

// Note rapide ({ note_rapide_id, texte? }) ou note libre ({ texte })
const ajouterNote = (id, note) => api.post(`/appels/${id}/actions`, note).then((r) => r.data)

export default { lister, obtenir, creer, modifier, ajouterNote }
