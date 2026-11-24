// Formulaire de la réceptionniste : message vocal transcrit ou appel pris en direct.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { LANGUES, SOURCES, maintenantLocal } from '../constantes'
import { useLangue } from '../i18n'

export default function NouvelAppel() {
  const navigate = useNavigate()
  const { t, tErreur } = useLangue()
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
      <h1 className="title is-4">{t('nouvel.titre')}</h1>

      <div className="columns">
        <div className="column is-7">
          <div className="box">
            <h2 className="subtitle is-6 has-text-weight-semibold">{t('nouvel.origine')}</h2>
            <div className="columns">
              <div className="column">
                <label className="label" htmlFor="source">{t('col.source')}</label>
                <div className="select is-fullwidth">
                  <select id="source" value={f.source} onChange={changer('source')}>
                    {SOURCES.map((v) => <option key={v} value={v}>{t(`source.${v}`)}</option>)}
                  </select>
                </div>
              </div>
              <div className="column">
                <label className="label" htmlFor="recu">{t('nouvel.date')}</label>
                <input id="recu" className="input" type="datetime-local" required value={f.recu_le} onChange={changer('recu_le')} />
              </div>
            </div>

            <h2 className="subtitle is-6 has-text-weight-semibold mt-5">{t('nouvel.qui')}</h2>
            <div className="columns is-multiline">
              <div className="column is-6">
                <label className="label" htmlFor="nom">{t('nouvel.nom')}</label>
                <input id="nom" className="input" value={f.nom_appelant} onChange={changer('nom_appelant')} />
              </div>
              <div className="column is-6">
                <label className="label" htmlFor="tel">{t('nouvel.telephone')}</label>
                <input id="tel" className="input" type="tel" required placeholder="819-555-0100"
                  value={f.telephone} onChange={changer('telephone')} />
              </div>
              <div className="column is-6">
                <label className="label" htmlFor="courriel">{t('col.courriel')}</label>
                <input id="courriel" className="input" type="email" value={f.courriel} onChange={changer('courriel')} />
              </div>
              <div className="column is-6">
                <span className="label">{t('nouvel.langue')}</span>
                <div className="buttons has-addons">
                  {LANGUES.map((v) => (
                    <button type="button" key={v}
                      className={`button ${f.langue === v ? 'is-primary' : ''}`}
                      aria-pressed={f.langue === v}
                      onClick={() => setF({ ...f, langue: v })}>{t(`langue.${v}`)}</button>
                  ))}
                </div>
              </div>
            </div>

            <h2 className="subtitle is-6 has-text-weight-semibold mt-5">{t('nouvel.pourquoi')}</h2>
            <div className="field">
              <label className="label" htmlFor="service">{t('col.service')}</label>
              <div className="select is-fullwidth">
                <select id="service" value={f.service_id} onChange={changer('service_id')}>
                  <option value="">{t('nouvel.aDeterminer')}</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="motif">{t('nouvel.motif')}</label>
              <textarea id="motif" className="textarea" rows="2" value={f.motif} onChange={changer('motif')} />
            </div>
          </div>
        </div>

        <div className="column is-5">
          <div className={`box ${f.confidentiel ? 'boite-confidentielle' : ''}`}>
            <label className="checkbox has-text-weight-semibold">
              <input type="checkbox" checked={f.confidentiel} onChange={changer('confidentiel')} className="mr-2" />
              {t('nouvel.confidentiel')}
            </label>
            {f.confidentiel && (
              <div className="field mt-3">
                <label className="label" htmlFor="consigne">{t('nouvel.consigne')}</label>
                <input id="consigne" className="input" placeholder={t('nouvel.consigneEx')}
                  value={f.consigne_confidentialite} onChange={changer('consigne_confidentialite')} />
              </div>
            )}
          </div>

          {estMessageVocal && (
            <div className="box">
              <label className="label" htmlFor="transcription">{t('nouvel.transcription')}</label>
              <p className="help mb-2">{t('nouvel.transcriptionAide')}</p>
              <textarea id="transcription" className="textarea" rows="8" value={f.transcription} onChange={changer('transcription')} />
            </div>
          )}

          {erreur && <p className="notification is-danger is-light">{tErreur(erreur)}</p>}
          <div className="buttons is-right">
            <button type="button" className="button is-light" onClick={() => navigate(-1)}>{t('nouvel.annuler')}</button>
            <button type="submit" className={`button is-primary${envoi ? ' is-loading' : ''}`}>{t('nouvel.creer')}</button>
          </div>
        </div>
      </div>
    </form>
  )
}
