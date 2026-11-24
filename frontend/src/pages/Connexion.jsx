import { useState } from 'react'
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
      <div className="box boite-connexion">
        <div className="is-flex is-justify-content-flex-end">
          <BoutonLangue />
        </div>
        <div className="has-text-centered mb-5">
          <span className="marque-icone grande" aria-hidden="true">☎</span>
          <h1 className="title is-4 mt-3 mb-1">{t('app.titre')}</h1>
          <p className="has-text-grey">{t('app.clinique')}</p>
        </div>

        <form onSubmit={soumettre}>
          <div className="field">
            <label className="label" htmlFor="courriel">{t('connexion.courriel')}</label>
            <input id="courriel" className="input" type="email" autoComplete="username" required
              value={courriel} onChange={(e) => setCourriel(e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="mdp">{t('connexion.mdp')}</label>
            <input id="mdp" className="input" type="password" autoComplete="current-password" required
              value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
          </div>
          {statut === 'failed' && erreur && <p className="notification is-danger is-light py-2">{tErreur(erreur)}</p>}
          <button className={`button is-primary is-fullwidth mt-4${envoi ? ' is-loading' : ''}`} type="submit">
            {t('connexion.bouton')}
          </button>
        </form>

        <p className="is-size-7 has-text-grey mt-5">
          {t('connexion.note')} <code>infirmiere@clinique.test</code> / <code>Demo123!</code>
        </p>
      </div>
    </section>
  )
}
