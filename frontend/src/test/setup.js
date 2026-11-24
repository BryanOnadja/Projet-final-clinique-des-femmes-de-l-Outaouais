import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Retire l'écran du test précédent, et oublie la langue et la session choisies
afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})
