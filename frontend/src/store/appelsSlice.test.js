// Tests de la logique pure : le reducer des appels (pas de DOM, pas de réseau).
import { describe, expect, it } from 'vitest'
import reducer, { FILTRES_VIDES, fetchAppels, filtreModifie, filtresEffaces } from './appelsSlice'

const etatDepart = { items: [], filtres: FILTRES_VIDES, status: 'idle', erreur: null }

describe('appelsSlice', () => {
  it('filtreModifie change un seul filtre et laisse les autres intacts', () => {
    const etat = reducer(etatDepart, filtreModifie({ cle: 'langue', valeur: 'es' }))
    expect(etat.filtres).toEqual({ ...FILTRES_VIDES, langue: 'es' })
  })

  it('filtresEffaces remet tous les filtres à vide', () => {
    const avecFiltres = { ...etatDepart, filtres: { statut: 'nouveau', service: '2', langue: 'en', q: 'Léa' } }
    expect(reducer(avecFiltres, filtresEffaces()).filtres).toEqual(FILTRES_VIDES)
  })

  it('ne modifie jamais l’état d’origine (immuabilité)', () => {
    const copie = structuredClone(etatDepart)
    reducer(etatDepart, filtreModifie({ cle: 'statut', valeur: 'regle' }))
    expect(etatDepart).toEqual(copie)
  })

  it('fetchAppels.pending met status à "loading"', () => {
    expect(reducer(etatDepart, { type: fetchAppels.pending.type }).status).toBe('loading')
  })

  it('fetchAppels.fulfilled place la liste reçue dans items', () => {
    const appels = [{ id: 1, nom_appelant: 'Léa Exemple' }, { id: 2, nom_appelant: 'Ana Fictif' }]
    const etat = reducer(etatDepart, { type: fetchAppels.fulfilled.type, payload: appels })
    expect(etat.status).toBe('succeeded')
    expect(etat.items).toEqual(appels)
  })

  it('fetchAppels.rejected met status à "failed" et garde le message', () => {
    const etat = reducer(etatDepart, { type: fetchAppels.rejected.type, error: { message: 'Erreur du serveur' } })
    expect(etat.status).toBe('failed')
    expect(etat.erreur).toBe('Erreur du serveur')
  })
})
