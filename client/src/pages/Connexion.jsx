import { useState } from 'react'
import { useAuth } from '../AuthContext'

export default function Connexion() {
  const { connexion } = useAuth()
  const [courriel, setCourriel] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    setEnvoi(true)
    try {
      await connexion(courriel, motDePasse)
    } catch (err) {
      setErreur(err.message)
      setEnvoi(false)
    }
  }

  return (
    <section className="page-connexion">
      <div className="box boite-connexion">
        <div className="has-text-centered mb-5">
          <span className="marque-icone grande" aria-hidden="true">☎</span>
          <h1 className="title is-4 mt-3 mb-1">Suivi des appels</h1>
          <p className="has-text-grey">Clinique des femmes de l'Outaouais</p>
        </div>

        <form onSubmit={soumettre}>
          <div className="field">
            <label className="label" htmlFor="courriel">Courriel</label>
            <input id="courriel" className="input" type="email" autoComplete="username" required
              value={courriel} onChange={(e) => setCourriel(e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="mdp">Mot de passe</label>
            <input id="mdp" className="input" type="password" autoComplete="current-password" required
              value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
          </div>
          {erreur && <p className="notification is-danger is-light py-2">{erreur}</p>}
          <button className={`button is-primary is-fullwidth mt-4${envoi ? ' is-loading' : ''}`} type="submit">
            Se connecter
          </button>
        </form>

        <p className="is-size-7 has-text-grey mt-5">
          Prototype étudiant (SED 2515) avec des données fictives.
          Compte de démo : <code>infirmiere@clinique.test</code> / <code>Demo123!</code>
        </p>
      </div>
    </section>
  )
}
