// Tests du reducer de connexion.
import { describe, expect, it } from 'vitest'
import reducer, { connexion, deconnecte, enDirectChange } from './authSlice'

const etatDepart = { utilisateur: null, statut: 'idle', erreur: null, enDirect: false }
const marie = { id: 3, nom: 'Marie Infirmière', role: 'membre' }

describe('authSlice', () => {
  it('connexion.pending met statut à "loading" et efface l’erreur', () => {
    const etat = reducer({ ...etatDepart, erreur: 'ancienne' }, { type: connexion.pending.type })
    expect(etat.statut).toBe('loading')
    expect(etat.erreur).toBeNull()
  })

  it('connexion.fulfilled garde la personne connectée', () => {
    const etat = reducer(etatDepart, { type: connexion.fulfilled.type, payload: marie })
    expect(etat.utilisateur).toEqual(marie)
    expect(etat.statut).toBe('idle')
  })

  it('connexion.rejected garde le message d’erreur', () => {
    const etat = reducer(etatDepart, { type: connexion.rejected.type, error: { message: 'Courriel ou mot de passe incorrect' } })
    expect(etat.statut).toBe('failed')
    expect(etat.erreur).toBe('Courriel ou mot de passe incorrect')
  })

  it('deconnecte retire la personne et coupe le temps réel', () => {
    const etat = reducer({ ...etatDepart, utilisateur: marie, enDirect: true }, deconnecte())
    expect(etat.utilisateur).toBeNull()
    expect(etat.enDirect).toBe(false)
  })

  it('enDirectChange suit l’état de la connexion Socket.io', () => {
    expect(reducer(etatDepart, enDirectChange(true)).enDirect).toBe(true)
  })
})
