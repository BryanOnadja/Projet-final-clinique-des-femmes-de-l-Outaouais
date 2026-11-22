// Fiche d'un appel : informations, prise en charge, notes rapides et historique.
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth, useEvenement } from '../AuthContext'
import { LANGUES, SOURCES, STATUTS, dateHeure } from '../constantes'
import { EtiquetteLangue, EtiquetteService, EtiquetteStatut } from '../components/Etiquettes'

export default function Fiche() {
  const { id } = useParams()
  const { utilisateur } = useAuth()
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

  if (erreur && !appel) return <p className="notification is-danger is-light">{erreur}</p>
  if (!appel) return <p>Chargement...</p>

  const cEstMoi = appel.pris_en_charge_par === utilisateur.id

  return (
    <>
      <Link to={appel.archive ? '/archives' : '/'} className="is-size-7">← Retour à la liste</Link>

      <div className="level mt-2 mb-4">
        <div className="level-left">
          <div>
            <h1 className="title is-4 mb-2">
              {appel.nom_appelant || 'Nom inconnu'} {appel.confidentiel ? '🔒' : ''}
            </h1>
            <div className="tags">
              <EtiquetteStatut statut={appel.statut} />
              <EtiquetteLangue langue={appel.langue} />
              <EtiquetteService nom={appel.service_nom} couleur={appel.service_couleur} />
              {appel.archive ? <span className="tag is-dark">Archivé</span> : null}
              {miseAJour && <span className="tag is-link is-light">Mis à jour par une collègue</span>}
            </div>
          </div>
        </div>
        <div className="level-right">
          {/* Prise en charge : évite que deux personnes rappellent la même cliente */}
          {!appel.pris_en_charge_par && (
            <button className="button is-primary is-medium" onClick={() => modifier({ prise_en_charge: 'moi' })}>
              ✋ Je m'en occupe
            </button>
          )}
          {appel.pris_en_charge_par && (
            <div className="prise-en-charge">
              <span>Pris en charge par <strong>{cEstMoi ? 'vous' : appel.pris_en_charge_nom}</strong></span>
              {cEstMoi
                ? <button className="button is-small is-light ml-3" onClick={() => modifier({ prise_en_charge: null })}>Libérer</button>
                : <button className="button is-small is-light ml-3" onClick={() => modifier({ prise_en_charge: 'moi' })}>Prendre le relais</button>}
            </div>
          )}
        </div>
      </div>

      {erreur && <p className="notification is-danger is-light">{erreur}</p>}

      {appel.confidentiel ? (
        <div className="notification is-danger is-light bandeau-confidentiel">
          <strong>🔒 Mesure de confidentialité demandée.</strong>{' '}
          {appel.consigne_confidentialite || 'Vérifiez avant de laisser un message.'}
        </div>
      ) : null}

      <div className="columns">
        {/* Colonne gauche : informations et historique */}
        <div className="column is-7">
          <div className="box">
            <table className="table is-fullwidth infos">
              <tbody>
                <tr><th>Téléphone</th><td className="is-size-5 has-text-weight-semibold">{appel.telephone}</td></tr>
                <tr><th>Courriel</th><td>{appel.courriel || '—'}</td></tr>
                <tr><th>Motif</th><td>{appel.motif || '—'}</td></tr>
                <tr><th>Langue</th><td>{LANGUES[appel.langue]}</td></tr>
                <tr><th>Source</th><td>{SOURCES[appel.source]}</td></tr>
                <tr><th>Reçu le</th><td>{dateHeure(appel.recu_le)}</td></tr>
                <tr><th>Fiche créée par</th><td>{appel.cree_par_nom}</td></tr>
              </tbody>
            </table>

            <div className="columns">
              <div className="column">
                <label className="label is-small" htmlFor="statut">Statut</label>
                <div className="select is-small is-fullwidth">
                  <select id="statut" value={appel.statut} onChange={(e) => modifier({ statut: e.target.value })}>
                    {Object.entries(STATUTS).map(([v, s]) => <option key={v} value={v}>{s.libelle}</option>)}
                  </select>
                </div>
              </div>
              <div className="column">
                <label className="label is-small" htmlFor="service">Service</label>
                <div className="select is-small is-fullwidth">
                  <select id="service" value={appel.service_id || ''} onChange={(e) => modifier({ service_id: e.target.value })}>
                    <option value="">À déterminer</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="column is-narrow is-flex is-align-items-flex-end">
                {appel.archive
                  ? <button className="button is-small" onClick={() => modifier({ archive: false })}>Sortir des archives</button>
                  : <button className="button is-small" onClick={() => modifier({ archive: true })}>Archiver</button>}
              </div>
            </div>
          </div>

          {appel.transcription && (
            <div className="box">
              <h2 className="subtitle is-6 has-text-weight-semibold mb-2">Transcription du message vocal</h2>
              <blockquote className="transcription">{appel.transcription}</blockquote>
            </div>
          )}

          <div className="box">
            <h2 className="subtitle is-6 has-text-weight-semibold">Historique</h2>
            <ul className="historique">
              {actions.map((a) => (
                <li key={a.id}>
                  <span className="quand">{dateHeure(a.cree_le)}</span>
                  <span className="qui">{a.utilisateur_nom}</span>
                  <span className="quoi">{a.texte}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Colonne droite : notes rapides */}
        <div className="column is-5">
          <div className="box">
            <h2 className="subtitle is-6 has-text-weight-semibold mb-3">Ajouter une note rapide</h2>
            <div className="notes-rapides">
              {notes.map((n) => (
                <button key={n.id}
                  className={`button note ${noteChoisie?.id === n.id ? 'is-link' : 'is-light'}`}
                  onClick={() => setNoteChoisie(noteChoisie?.id === n.id ? null : n)}>
                  <span>{n.texte}</span>
                  {n.statut_resultant && <span className="statut-resultant">→ {STATUTS[n.statut_resultant].libelle}</span>}
                </button>
              ))}
            </div>
            {noteChoisie && (
              <div className="mt-3">
                <label className="label is-small" htmlFor="complement">Compléter (facultatif)</label>
                <div className="field has-addons">
                  <div className="control is-expanded">
                    <input id="complement" className="input" autoFocus placeholder="Ex. : jeudi vers 14 h"
                      value={complement} onChange={(e) => setComplement(e.target.value)} />
                  </div>
                  <div className="control">
                    <button className="button is-primary"
                      onClick={() => ajouterNote({ note_rapide_id: noteChoisie.id, texte: complement })}>
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="box">
            <h2 className="subtitle is-6 has-text-weight-semibold mb-3">Note libre</h2>
            <textarea className="textarea" rows="3" placeholder="Écrire une note..."
              value={noteLibre} onChange={(e) => setNoteLibre(e.target.value)} />
            <button className="button is-link mt-2" disabled={!noteLibre.trim()}
              onClick={() => ajouterNote({ texte: noteLibre })}>
              Ajouter la note
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
