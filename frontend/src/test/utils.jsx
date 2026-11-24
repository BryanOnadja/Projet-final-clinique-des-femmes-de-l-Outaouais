// Affiche un composant avec un store Redux NEUF (pas partagé entre les tests),
// le routeur et la langue, comme dans l'application.
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { LangueProvider } from '../i18n'
import { creerStore } from '../store/store'

export function renderAvecApp(ui, { etatInitial, langue } = {}) {
  if (langue) localStorage.setItem('langue', langue)
  const store = creerStore(etatInitial)
  return {
    store,
    ...render(
      <LangueProvider>
        <Provider store={store}>
          <MemoryRouter>{ui}</MemoryRouter>
        </Provider>
      </LangueProvider>,
    ),
  }
}
