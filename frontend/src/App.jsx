import { Navigate, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useConnexionTempsReel, useDeconnexionInactivite } from './hooks/tempsReel'
import Navigation from './components/Navigation'
import Connexion from './pages/Connexion'
import Tableau from './pages/Tableau'
import NouvelAppel from './pages/NouvelAppel'
import Fiche from './pages/Fiche'
import Archives from './pages/Archives'
import Admin from './pages/Admin'

// Les pages protégées : il faut être connectée (et admin pour /admin)
function Protege({ children, admin = false }) {
  const utilisateur = useSelector((state) => state.auth.utilisateur)
  if (!utilisateur) return <Navigate to="/connexion" replace />
  if (admin && utilisateur.role !== 'admin') return <Navigate to="/" replace />
  return (
    <div className="coquille">
      <Navigation />
      <main className="contenu" id="contenu">
        <div className="contenu-interieur">{children}</div>
      </main>
    </div>
  )
}

export default function App() {
  const utilisateur = useSelector((state) => state.auth.utilisateur)
  useConnexionTempsReel()
  useDeconnexionInactivite()
  return (
    <Routes>
      <Route path="/connexion" element={utilisateur ? <Navigate to="/" replace /> : <Connexion />} />
      <Route path="/" element={<Protege><Tableau /></Protege>} />
      <Route path="/nouvel-appel" element={<Protege><NouvelAppel /></Protege>} />
      <Route path="/appels/:id" element={<Protege><Fiche /></Protege>} />
      <Route path="/archives" element={<Protege><Archives /></Protege>} />
      <Route path="/admin" element={<Protege admin><Admin /></Protege>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
