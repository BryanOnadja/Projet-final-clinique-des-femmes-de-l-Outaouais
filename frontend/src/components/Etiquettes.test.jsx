// Tests de composants simples : ce que l'utilisateur voit, en français et en anglais.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { BoutonLangue, LangueProvider } from '../i18n'
import { Cadenas, EtiquetteStatut } from './Etiquettes'

const avecLangue = (ui) => render(<LangueProvider>{ui}</LangueProvider>)

describe('EtiquetteStatut', () => {
  it('affiche le statut en français par défaut', () => {
    avecLangue(<EtiquetteStatut statut="en_attente" />)
    expect(screen.getByText('En attente')).toBeInTheDocument()
  })

  it('affiche le statut en anglais après un clic sur EN', async () => {
    const user = userEvent.setup()
    avecLangue(<><BoutonLangue /><EtiquetteStatut statut="regle" /></>)
    expect(screen.getByText('Réglé')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(screen.getByText('Resolved')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('langue')).toBe('en') // le choix est mémorisé
  })
})

describe('Cadenas', () => {
  it('annonce « Confidentiel » aux lecteurs d’écran', () => {
    avecLangue(<Cadenas />)
    expect(screen.getByLabelText('Confidentiel')).toBeInTheDocument()
  })
})
