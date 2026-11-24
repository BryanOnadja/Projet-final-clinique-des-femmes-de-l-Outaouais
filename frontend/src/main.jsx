import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bulma/css/bulma.min.css'
import './styles.css'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { LangueProvider } from './i18n.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LangueProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </LangueProvider>
    </BrowserRouter>
  </StrictMode>,
)
