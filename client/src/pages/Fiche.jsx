// Fiche d'un appel : informations, prise en charge, notes rapides et historique.
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth, useEvenement } from '../AuthContext'
import { STATUTS } from '../constantes'
import { useLangue } from '../i18n'
import { EtiquetteLangue, EtiquetteService, EtiquetteStatut } from '../components/Etiquettes'

export default function Fiche() {
  const { id } = useParams()
  const { utilisateur } = useAuth()
  const { t, tErreur, tAction, dateHeure } = useLangue()
  const [appel, setAppel] = useState(null)
  const [actions, setActions] = useState([])
  const [notes, setNotes] = useState([])
  const [services, setServices] = useState([])
  const [noteChoisie, setNoteChoisie] = useState(null)
  const [complement, setComplement] = useState('')
  const [noteLibre, setNoteLibre] = useState('')
  const [erreur, setErreur] = useState('')
  const [miseAJour, setMiseAJour] = useState(false)

  const charger = useCallback(async () => {
    try {
      const r = await api(`/appels/${id}`)
      setAppel(r.appel)
      setActions(r.actions)
    } catch (err) {
      setErreur(err.message)
    }
  }, [id])

  const chargerConfiguration = () => {
    api('/notes-rapides').then(setNotes)
    api('/services').then(setServices)
  }

  useEffect(() => { charger() }, [charger])
  useEffect(chargerConfiguration, [])

  // Si une collègue modifie cet appel, la fiche se met à jour toute seule
  useEvenement('appel:modifie', ({ appel: a }) => {
    if (a.id === Number(id)) {
      charger()
      setMiseAJour(true)
      setTimeout(() => setMiseAJour(false), 2000)
    }
  })
  useEvenement('configuration:modifiee', chargerConfiguration)

  async function modifier(corps) {
    setErreur('')
    try {
      await api(`/appels/${id}`, { methode: 'PATCH', corps })
      await charger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  async function ajouterNote(corps) {
    setErreur('')
    try {
      const r = await api(`/appels/${id}/actions`, { methode: 'POST', corps })
      setAppel(r.appel)
      setActions(r.actions)
      setNoteChoisie(null)
      setComplement('')
      setNoteLibre('')
    } catch (err) {
      setErreur(err.message)
    }
  }

  if (erreur && !appel) return <p className="notification is-danger is-light">{tErreur(erreur)}</p>
  if (!appel) return <p>{t('fiche.chargement')}</p>

  const cEstMoi = appel.pris_en_charge_par === utilisateur.id

  return (
    <>
      <Link to={appel.archive ? '/archives' : '/'} className="is-size-7">{t('fiche.retour')}</Link>

      <div className="level mt-2 mb-4">
        <div className="level-left">
          <div>
            <h1 className="title is-4 mb-2">
              {appel.nom_appelant || t('tableau.nomInconnu')} {appel.confidentiel ? '🔒' : ''}
            </h1>
            <div className="tags">
              <EtiquetteStatut statut={appel.statut} />
              <EtiquetteLangue langue={appel.langue} />
              <EtiquetteService nom={appel.service_nom} couleur={appel.service_couleur} />
              {appel.archive ? <span className="tag is-dark">{t('fiche.archive')}</span> : null}
              {miseAJour && <span className="tag is-link is-light">{t('fiche.majCollegue')}</span>}
            </div>
          </div>
        </div>
        <div className="level-right">
          {/* Prise en charge : évite que deux personnes rappellent la même cliente */}
          {!appel.pris_en_charge_par && (
            <button className="button is-primary is-medium" onClick={() => modifier({ prise_en_charge: 'moi' })}>
              {t('fiche.jeMenOccupe')}
            </button>
          )}
          {appel.pris_en_charge_par && (
            <div className="prise-en-charge">
              <span>{t('fiche.prisPar')} <strong>{cEstMoi ? t('fiche.vous') : appel.pris_en_charge_nom}</strong></span>
              {cEstMoi
                ? <button className="button is-small is-light ml-3" onClick={() => modifier({ prise_en_charge: null })}>{t('fiche.liberer')}</button>
                : <button className="button is-small is-light ml-3" onClick={() => modifier({ prise_en_charge: 'moi' })}>{t('fiche.relais')}</button>}
            </div>
          )}
        </div>
      </div>

      {erreur && <p className="notification is-danger is-light">{tErreur(erreur)}</p>}

      {appel.confidentiel ? (
        <div className="notification is-danger is-light bandeau-confidentiel">
          <strong>🔒 {t('confidentiel.titre')}.</strong>{' '}
          {appel.consigne_confidentialite || t('fiche.confidentielDefaut')}
        </div>
      ) : null}

      <div className="columns">
        {/* Colonne gauche : informations et historique */}
        <div className="column is-7">
          <div className="box">
            <table className="table is-fullwidth infos">
              <tbody>
                <tr><th>{t('col.telephone')}</th><td className="is-size-5 has-text-weight-semibold">{appel.telephone}</td></tr>
                <tr><th>{t('col.courriel')}</th><td>{appel.courriel || '—'}</td></tr>
                <tr><th>{t('col.motif')}</th><td>{appel.motif || '—'}</td></tr>
                <tr><th>{t('col.langue')}</th><td>{t(`langue.${appel.langue}`)}</td></tr>
                <tr><th>{t('col.source')}</th><td>{t(`source.${appel.source}`)}</td></tr>
                <tr><th>{t('col.recuLe')}</th><td>{dateHeure(appel.recu_le)}</td></tr>
                <tr><th>{t('fiche.creePar')}</th><td>{appel.cree_par_nom}</td></tr>
              </tbody>
            </table>

            <div className="columns">
              <div className="column">
                <label className="label is-small" htmlFor="statut">{t('col.statut')}</label>
                <div className="select is-small is-fullwidth">
                  <select id="statut" value={appel.statut} onChange={(e) => modifier({ statut: e.target.value })}>
                    {Object.keys(STATUTS).map((v) => <option key={v} value={v}>{t(`statut.${v}`)}</option>)}
                  </select>
                </div>
              </div>
              <div className="column">
                <label className="label is-small" htmlFor="service">{t('col.service')}</label>
                <div className="select is-small is-fullwidth">
                  <select id="service" value={appel.service_id || ''} onChange={(e) => modifier({ service_id: e.target.value })}>
                    <option value="">{t('nouvel.aDeterminer')}</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="column is-narrow is-flex is-align-items-flex-end">
                {appel.archive
                  ? <button className="button is-small" onClick={() => modifier({ archive: false })}>{t('fiche.desarchiver')}</button>
                  : <button className="button is-small" onClick={() => modifier({ archive: true })}>{t('fiche.archiver')}</button>}
              </div>
            </div>
          </div>

          {appel.transcription && (
            <div className="box">
              <h2 className="subtitle is-6 has-text-weight-semibold mb-2">{t('nouvel.transcription')}</h2>
              <blockquote className="transcription">{appel.transcription}</blockquote>
            </div>
          )}

          <div className="box">
            <h2 className="subtitle is-6 has-text-weight-semibold">{t('fiche.historique')}</h2>
            <ul className="historique">
              {actions.map((a) => (
                <li key={a.id}>
                  <span className="quand">{dateHeure(a.cree_le)}</span>
                  <span className="qui">{a.utilisateur_nom}</span>
                  <span className="quoi">{tAction(a.texte)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Colonne droite : notes rapides */}
        <div className="column is-5">
          <div className="box">
            <h2 className="subtitle is-6 has-text-weight-semibold mb-3">{t('fiche.noteRapide')}</h2>
            <div className="notes-rapides">
              {notes.map((n) => (
                <button key={n.id}
                  className={`button note ${noteChoisie?.id === n.id ? 'is-link' : 'is-light'}`}
                  onClick={() => setNoteChoisie(noteChoisie?.id === n.id ? null : n)}>
                  <span>{n.texte}</span>
                  {n.statut_resultant && <span className="statut-resultant">→ {t(`statut.${n.statut_resultant}`)}</span>}
                </button>
              ))}
            </div>
            {noteChoisie && (
              <div className="mt-3">
                <label className="label is-small" htmlFor="complement">{t('fiche.completer')}</label>
                <div className="field has-addons">
                  <div className="control is-expanded">
                    <input id="complement" className="input" autoFocus placeholder={t('fiche.completerEx')}
                      value={complement} onChange={(e) => setComplement(e.target.value)} />
                  </div>
                  <div className="control">
                    <button className="button is-primary"
                      onClick={() => ajouterNote({ note_rapide_id: noteChoisie.id, texte: complement })}>
                      {t('fiche.enregistrer')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="box">
            <h2 className="subtitle is-6 has-text-weight-semibold mb-3">{t('fiche.noteLibre')}</h2>
            <textarea className="textarea" rows="3" placeholder={t('fiche.ecrire')}
              value={noteLibre} onChange={(e) => setNoteLibre(e.target.value)} />
            <button className="button is-link mt-2" disabled={!noteLibre.trim()}
              onClick={() => ajouterNote({ texte: noteLibre })}>
              {t('fiche.ajouterNote')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
