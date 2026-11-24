import { useState } from 'react'
import { CircleAlert } from 'lucide-react'
import Logo from '../components/Logo'
import { useDispatch, useSelector } from 'react-redux'
import { connexion } from '../store/authSlice'
import { BoutonLangue, useLangue } from '../i18n'

export default function Connexion() {
  const dispatch = useDispatch()
  const { statut, erreur } = useSelector((state) => state.auth)
  const { t, tErreur } = useLangue()
  const [courriel, setCourriel] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const envoi = statut === 'loading'

  function soumettre(e) {
    e.preventDefault()
    dispatch(connexion({ courriel, motDePasse }))
  }

  return (
    <section className="page-connexion">
      <div className="panneau-marque">
        <Logo taille={56} />
        <h1 className="titre-marque">{t('app.titre')}</h1>
        <p className="clinique-marque">{t('app.clinique')}</p>
        <p className="accroche">{t('connexion.accroche')}</p>
        <p className="note-prototype">{t('connexion.note')} <code>infirmiere@clinique.test</code> / <code>Demo123!</code></p>
      </div>

      <div className="panneau-formulaire">
        <div className="haut-formulaire">
          <BoutonLangue />
        </div>
        <form onSubmit={soumettre} className="formulaire-connexion">
          <h2 className="titre-formulaire">{t('connexion.bouton')}</h2>
          <div className="field">
            <label className="label" htmlFor="courriel">{t('connexion.courriel')}</label>
            <input id="courriel" className="input is-medium" type="email" autoComplete="username" required
              value={courriel} onChange={(e) => setCourriel(e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="mdp">{t('connexion.mdp')}</label>
            <input id="mdp" className="input is-medium" type="password" autoComplete="current-password" required
              value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
          </div>
          {statut === 'failed' && erreur && (
            <p className="message-erreur" role="alert">
              <CircleAlert size={18} aria-hidden="true" /> {tErreur(erreur)}
            </p>
          )}
          <button className={`button is-primary is-medium is-fullwidth mt-5${envoi ? ' is-loading' : ''}`} type="submit">
            {t('connexion.bouton')}
          </button>
        </form>
      </div>
    </section>
  )
}
