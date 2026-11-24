import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { deconnexion } from '../store/authSlice'
import { BoutonLangue, useLangue } from '../i18n'

export default function Navigation() {
  const dispatch = useDispatch()
  const { utilisateur, enDirect } = useSelector((state) => state.auth)
  const { t } = useLangue()
  const [ouvert, setOuvert] = useState(false)
  const lien = ({ isActive }) => `navbar-item${isActive ? ' is-active' : ''}`

  return (
    <nav className="navbar barre" aria-label="Navigation">
      <div className="navbar-brand">
        <NavLink to="/" className="navbar-item marque">
          <span className="marque-icone" aria-hidden="true">☎</span>
          <span>
            <strong>{t('app.titre')}</strong>
            <small className="is-block">{t('app.clinique')}</small>
          </span>
        </NavLink>
        <button
          className={`navbar-burger${ouvert ? ' is-active' : ''}`}
          aria-label={t('nav.menu')}
          aria-expanded={ouvert}
          onClick={() => setOuvert(!ouvert)}
        >
          <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
        </button>
      </div>

      <div className={`navbar-menu${ouvert ? ' is-active' : ''}`}>
        <div className="navbar-start" onClick={() => setOuvert(false)}>
          <NavLink to="/" end className={lien}>{t('nav.appels')}</NavLink>
          <NavLink to="/nouvel-appel" className={lien}>{t('nav.nouvel')}</NavLink>
          <NavLink to="/archives" className={lien}>{t('nav.archives')}</NavLink>
          {utilisateur.role === 'admin' && <NavLink to="/admin" className={lien}>{t('nav.admin')}</NavLink>}
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <span className={`direct ${enDirect ? 'est-actif' : ''}`} title={t('nav.directTitre')}>
              <span className="point" /> {enDirect ? t('nav.direct') : t('nav.horsLigne')}
            </span>
          </div>
          <div className="navbar-item">
            <BoutonLangue />
          </div>
          <div className="navbar-item">
            <span className="mr-3">{utilisateur.nom}</span>
            <button className="button is-small is-light" onClick={() => dispatch(deconnexion())}>{t('nav.deconnexion')}</button>
          </div>
        </div>
      </div>
    </nav>
  )
}
