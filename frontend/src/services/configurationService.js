import { api } from './api'

const listerNotesRapides = (tous = false) => api.get('/notes-rapides', { params: tous ? { tous: 1 } : {} }).then((r) => r.data)
const creerNoteRapide = (note) => api.post('/notes-rapides', note).then((r) => r.data)
const modifierNoteRapide = (id, note) => api.patch(`/notes-rapides/${id}`, note).then((r) => r.data)

const listerServices = () => api.get('/services').then((r) => r.data)
const creerService = (service) => api.post('/services', service).then((r) => r.data)
const modifierService = (id, service) => api.patch(`/services/${id}`, service).then((r) => r.data)

const listerUtilisateurs = () => api.get('/utilisateurs').then((r) => r.data)
const creerUtilisateur = (compte) => api.post('/utilisateurs', compte).then((r) => r.data)
const modifierUtilisateur = (id, champs) => api.patch(`/utilisateurs/${id}`, champs).then((r) => r.data)

export default {
  listerNotesRapides, creerNoteRapide, modifierNoteRapide,
  listerServices, creerService, modifierService,
  listerUtilisateurs, creerUtilisateur, modifierUtilisateur,
}
