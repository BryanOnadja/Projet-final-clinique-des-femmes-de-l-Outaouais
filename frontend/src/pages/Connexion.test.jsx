// Test de l'écran de connexion complet : formulaire + Redux, avec le service réseau simulé.
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import authService from '../services/authService'
import { renderAvecApp } from '../test/utils'
import Connexion from './Connexion'

// On remplace seulement la frontière réseau : aucun appel au vrai back-end
vi.mock('../services/authService', () => ({ default: { connexion: vi.fn() } }))

describe('Écran de connexion', () => {
  it('envoie le courriel et le mot de passe, puis garde la personne connectée', async () => {
    const marie = { id: 3, nom: 'Marie Infirmière', courriel: 'infirmiere@clinique.test', role: 'membre' }
    vi.mocked(authService.connexion).mockResolvedValueOnce({ jeton: 'jeton-test', utilisateur: marie })
    const user = userEvent.setup()
    const { store } = renderAvecApp(<Connexion />)

    await user.type(screen.getByLabelText('Courriel'), 'infirmiere@clinique.test')
    await user.type(screen.getByLabelText('Mot de passe'), 'Demo123!')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(authService.connexion).toHaveBeenCalledWith('infirmiere@clinique.test', 'Demo123!')
    expect(store.getState().auth.utilisateur).toEqual(marie)
    expect(sessionStorage.getItem('jeton')).toBe('jeton-test')
  })

  it('affiche l’erreur du serveur, traduite en anglais', async () => {
    vi.mocked(authService.connexion).mockImplementationOnce(async () => {
      throw new Error('Courriel ou mot de passe incorrect')
    })
    const user = userEvent.setup()
    renderAvecApp(<Connexion />, { langue: 'en' })

    await user.type(screen.getByLabelText('Email'), 'reception@clinique.test')
    await user.type(screen.getByLabelText('Password'), 'mauvais')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Incorrect email or password')).toBeInTheDocument()
  })
})
