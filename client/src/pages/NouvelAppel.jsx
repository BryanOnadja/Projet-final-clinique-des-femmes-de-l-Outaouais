// Formulaire de la réceptionniste : message vocal transcrit ou appel pris en direct.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { LANGUES, SOURCES, maintenantLocal } from '../constantes'

export default function NouvelAppel() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [f, setF] = useState({
    source: 'boite_1',
    recu_le: maintenantLocal(),
    nom_appelant: '',
    telephone: '',
    courriel: '',
    langue: 'fr',
    service_id: '',
    motif: '',
    confidentiel: false,
    consigne_confidentialite: '',
    transcription: '',
  })

  useEffect(() => { api('/services').then(setServices) }, [])

  const changer = (cle) => (e) =>
    setF({ ...f, [cle]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  async function soumettre(e) {
    e.preventDefault()
    setErreur('')
    setEnvoi(true)
    try {
      const appel = await api('/appels', { methode: 'POST', corps: f })
      navigate(`/appels/${appel.id}`)
    } catch (err) {
      setErreur(err.message)
      setEnvoi(false)
    }
  }

  const estMessageVocal = f.source !== 'reception'

  return (
    <form onSubmit={soumettre} className="formulaire-appel">
      <h1 className="title is-4">Nouvel appel</h1>

      <div className="columns">
        <div className="column is-7">
          <div className="box">
            <h2 className="subtitle is-6 has-text-weight-semibold">D'où vient l'appel ?</h2>
            <div className="columns">
              <div className="column">
                <label className="label" htmlFor="source">Source</label>
                <div className="select is-fullwidth">
                  <select id="source" value={f.source} onChange={changer('source')}>
                    {Object.entries(SOURCES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="column">
                <label className="label" htmlFor="recu">Date et heure de l'appel</label>
                <input id="recu" className="input" type="datetime-local" required value={f.recu_le} onChange={changer('recu_le')} />
              </div>
            </div>

            <h2 className="subtitle is-6 has-text-weight-semibold mt-5">Qui a appelé ?</h2>
            <div className="columns is-multiline">
              <div className="column is-6">
                <label className="label" htmlFor="nom">Nom</label>
                <input id="nom" className="input" value={f.nom_appelant} onChange={changer('nom_appelant')} />
              </div>
              <div className="column is-6">
                <label className="label" htmlFor="tel">Téléphone *</label>
                <input id="tel" className="input" type="tel" required placeholder="819-555-0100"
                  value={f.telephone} onChange={changer('telephone')} />
              </div>
              <div className="column is-6">
                <label className="label" htmlFor="courriel">Courriel</label>
                <input id="courriel" className="input" type="email" value={f.courriel} onChange={changer('courriel')} />
              </div>
              <div className="column is-6">
                <span className="label">Langue de l'appel</span>
                <div className="buttons has-addons">
                  {Object.entries(LANGUES).map(([v, l]) => (
                    <button type="button" key={v}
                      className={`button ${f.langue === v ? 'is-primary' : ''}`}
                      aria-pressed={f.langue === v}
                      onClick={() => setF({ ...f, langue: v })}>{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <h2 className="subtitle is-6 has-text-weight-semibold mt-5">Pourquoi ?</h2>
            <div className="field">
              <label className="label" htmlFor="service">Service</label>
              <div className="select is-fullwidth">
                <select id="service" value={f.service_id} onChange={changer('service_id')}>
                  <option value="">À déterminer</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="motif">Motif de l'appel</label>
              <textarea id="motif" className="textarea" rows="2" value={f.motif} onChange={changer('motif')} />
            </div>
          </div>
        </div>

        <div className="column is-5">
          <div className={`box ${f.confidentiel ? 'boite-confidentielle' : ''}`}>
            <label className="checkbox has-text-weight-semibold">
              <input type="checkbox" checked={f.confidentiel} onChange={changer('confidentiel')} className="mr-2" />
              🔒 La personne demande une mesure de confidentialité
            </label>
            {f.confidentiel && (
              <div className="field mt-3">
                <label className="label" htmlFor="consigne">Consigne</label>
                <input id="consigne" className="input" placeholder="Ex. : ne pas laisser de message"
                  value={f.consigne_confidentialite} onChange={changer('consigne_confidentialite')} />
              </div>
            )}
          </div>

          {estMessageVocal && (
            <div className="box">
              <label className="label" htmlFor="transcription">Transcription du message vocal</label>
              <p className="help mb-2">Collez ici le texte reçu par courriel du système téléphonique.</p>
              <textarea id="transcription" className="textarea" rows="8" value={f.transcription} onChange={changer('transcription')} />
            </div>
          )}

          {erreur && <p className="notification is-danger is-light">{erreur}</p>}
          <div className="buttons is-right">
            <button type="button" className="button is-light" onClick={() => navigate(-1)}>Annuler</button>
            <button type="submit" className={`button is-primary${envoi ? ' is-loading' : ''}`}>Créer la fiche</button>
          </div>
        </div>
      </div>
    </form>
  )
}
