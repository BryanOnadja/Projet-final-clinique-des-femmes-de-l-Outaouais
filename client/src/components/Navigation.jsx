import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Navigation() {
  const { utilisateur, deconnexion, enDirect } = useAuth()
  const [ouvert, setOuvert] = useState(false)
  const lien = ({ isActive }) => `navbar-item${isActive ? ' is-active' : ''}`

  return (
    <nav className="navbar barre" aria-label="Navigation principale">
      <div className="navbar-brand">
        <NavLink to="/" className="navbar-item marque">
          <span className="marque-icone" aria-hidden="true">☎</span>
          <span>
            <strong>Suivi des appels</strong>
            <small className="is-block">Clinique des femmes de l'Outaouais</small>
          </span>
        </NavLink>
        <button
          className={`navbar-burger${ouvert ? ' is-active' : ''}`}
          aria-label="Menu"
          aria-expanded={ouvert}
          onClick={() => setOuvert(!ouvert)}
        >
          <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
        </button>
      </div>

      <div className={`navbar-menu${ouvert ? ' is-active' : ''}`} onClick={() => setOuvert(false)}>
        <div className="navbar-start">
          <NavLink to="/" end className={lien}>Appels</NavLink>
          <NavLink to="/nouvel-appel" className={lien}>+ Nouvel appel</NavLink>
          <NavLink to="/archives" className={lien}>Archives et recherche</NavLink>
          {utilisateur.role === 'admin' && <NavLink to="/admin" className={lien}>Administration</NavLink>}
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <span className={`direct ${enDirect ? 'est-actif' : ''}`} title="Mises à jour en temps réel">
              <span className="point" /> {enDirect ? 'En direct' : 'Hors ligne'}
            </span>
          </div>
          <div className="navbar-item">
            <span className="mr-3">{utilisateur.nom}</span>
            <button className="button is-small is-light" onClick={deconnexion}>Déconnexion</button>
          </div>
        </div>
      </div>
    </nav>
  )
}
