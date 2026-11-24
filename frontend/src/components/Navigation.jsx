// Barre latérale : logo, menu, état du temps réel, langue et personne connectée.
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { Archive, Inbox, LogOut, Menu, PhoneIncoming, Settings, X } from 'lucide-react'
import { BoutonLangue, useLangue } from '../i18n'
import { deconnexion } from '../store/authSlice'
import Logo, { Avatar } from './Logo'

export default function Navigation() {
  const dispatch = useDispatch()
  const { utilisateur, enDirect } = useSelector((state) => state.auth)
  const { t } = useLangue()
  const [ouvert, setOuvert] = useState(false)

  const lien = ({ isActive }) => `lien-nav${isActive ? ' est-actif' : ''}`
  const fermer = () => setOuvert(false)

  return (
    <>
      {/* Barre du haut, sur téléphone seulement */}
      <header className="barre-mobile">
        <NavLink to="/" className="marque" onClick={fermer}>
          <Logo taille={28} />
          <span className="marque-nom">{t('app.titre')}</span>
        </NavLink>
        <button className="bouton-icone" aria-label={t('nav.menu')} aria-expanded={ouvert} onClick={() => setOuvert(!ouvert)}>
          {ouvert ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </header>

      <aside className={`barre-laterale${ouvert ? ' est-ouverte' : ''}`} aria-label="Navigation">
        <NavLink to="/" className="marque marque-laterale" onClick={fermer}>
          <Logo taille={34} />
          <span>
            <span className="marque-nom">{t('app.titre')}</span>
            <span className="marque-clinique">{t('app.clinique')}</span>
          </span>
        </NavLink>

        <nav className="menu-principal" onClick={fermer}>
          <NavLink to="/" end className={lien}>
            <Inbox size={19} aria-hidden="true" /> {t('nav.appels')}
          </NavLink>
          <NavLink to="/nouvel-appel" className={lien}>
            <PhoneIncoming size={19} aria-hidden="true" /> {t('nav.nouvel')}
          </NavLink>
          <NavLink to="/archives" className={lien}>
            <Archive size={19} aria-hidden="true" /> {t('nav.archives')}
          </NavLink>
          {utilisateur.role === 'admin' && (
            <NavLink to="/admin" className={lien}>
              <Settings size={19} aria-hidden="true" /> {t('nav.admin')}
            </NavLink>
          )}
        </nav>

        <div className="pied-lateral">
          <div className="ligne-pied">
            <span className={`direct${enDirect ? ' est-actif' : ''}`} title={t('nav.directTitre')}>
              <span className="point" aria-hidden="true" /> {enDirect ? t('nav.direct') : t('nav.horsLigne')}
            </span>
            <BoutonLangue sombre />
          </div>
          <div className="carte-utilisatrice">
            <Avatar nom={utilisateur.nom} />
            <span className="identite">
              <span className="identite-nom">{utilisateur.nom}</span>
              <span className="identite-role">{t(`role.${utilisateur.role}`)}</span>
            </span>
          </div>
          <button className="bouton-deconnexion" onClick={() => dispatch(deconnexion())}>
            <LogOut size={17} aria-hidden="true" /> {t('nav.deconnexion')}
          </button>
        </div>
      </aside>
      {ouvert && <div className="voile" onClick={fermer} aria-hidden="true" />}
    </>
  )
}
