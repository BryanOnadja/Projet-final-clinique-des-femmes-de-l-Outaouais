// Fiche d'un appel : informations, prise en charge, notes rapides et historique.
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { useEvenement } from '../hooks/tempsReel'
import appelsService from '../services/appelsService'
import { fetchConfiguration } from '../store/configurationSlice'
import { STATUTS } from '../constantes'
import { Archive, ArchiveRestore, ArrowLeft, CircleAlert, History, MessageSquarePlus, Phone, RefreshCw, ShieldAlert, UserCheck, Voicemail } from 'lucide-react'
import { Avatar } from '../components/Logo'
import { useLangue } from '../i18n'
import { Cadenas, EtiquetteLangue, EtiquetteService, EtiquetteStatut } from '../components/Etiquettes'

export default function Fiche() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const utilisateur = useSelector((state) => state.auth.utilisateur)
  const { services, notesRapides: notes } = useSelector((state) => state.configuration)
  const { t, tErreur, tAction, dateHeure } = useLangue()
  const [appel, setAppel] = useState(null)
  const [actions, setActions] = useState([])
  const [noteChoisie, setNoteChoisie] = useState(null)
  const [complement, setComplement] = useState('')
  const [noteLibre, setNoteLibre] = useState('')
  const [erreur, setErreur] = useState('')
  const [miseAJour, setMiseAJour] = useState(false)

  const charger = useCallback(async () => {
    try {
      const r = await appelsService.obtenir(id)
      setAppel(r.appel)
      setActions(r.actions)
    } catch (err) {
      setErreur(err.message)
    }
  }, [id])

  const chargerConfiguration = () => {
    dispatch(fetchConfiguration())
  }

  useEffect(() => { charger() }, [charger])
  useEffect(() => { dispatch(fetchConfiguration()) }, [dispatch])

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
      await appelsService.modifier(id, corps)
      await charger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  async function ajouterNote(corps) {
    setErreur('')
    try {
      const r = await appelsService.ajouterNote(id, corps)
      setAppel(r.appel)
      setActions(r.actions)
      setNoteChoisie(null)
      setComplement('')
      setNoteLibre('')
    } catch (err) {
      setErreur(err.message)
    }
  }

  if (erreur && !appel) return <p className="message-erreur">{tErreur(erreur)}</p>
  if (!appel) return <p className="texte-discret">{t('fiche.chargement')}</p>

  const cEstMoi = appel.pris_en_charge_par === utilisateur.id

  return (
    <>
      <Link to={appel.archive ? '/archives' : '/'} className="lien-retour">
        <ArrowLeft size={16} aria-hidden="true" /> {t('fiche.retour')}
      </Link>

      <header className="entete-fiche">
        <div>
          <h1 className="titre-page">
            {appel.nom_appelant || t('tableau.nomInconnu')}
            {appel.confidentiel ? <Cadenas /> : null}
          </h1>
          <div className="meta-fiche">
            <EtiquetteStatut statut={appel.statut} />
            <EtiquetteLangue langue={appel.langue} />
            <EtiquetteService nom={appel.service_nom} couleur={appel.service_couleur} />
            {appel.archive ? <span className="pilule pilule-neutre"><Archive size={13} aria-hidden="true" /> {t('fiche.archive')}</span> : null}
            {miseAJour && <span className="pilule pilule-info" role="status"><RefreshCw size={13} aria-hidden="true" /> {t('fiche.majCollegue')}</span>}
          </div>
        </div>

        {/* Prise en charge : évite que deux personnes rappellent la même cliente */}
        {!appel.pris_en_charge_par ? (
          <button className="button is-primary is-medium" onClick={() => modifier({ prise_en_charge: 'moi' })}>
            <UserCheck size={20} aria-hidden="true" /> <span>{t('fiche.jeMenOccupe')}</span>
          </button>
        ) : (
          <div className="prise-en-charge">
            <Avatar nom={appel.pris_en_charge_nom} />
            <span className="prise-texte">
              <span className="texte-discret">{t('fiche.prisPar')}</span>
              <strong>{cEstMoi ? t('fiche.vous') : appel.pris_en_charge_nom}</strong>
            </span>
            {cEstMoi
              ? <button className="button is-small is-white" onClick={() => modifier({ prise_en_charge: null })}>{t('fiche.liberer')}</button>
              : <button className="button is-small is-white" onClick={() => modifier({ prise_en_charge: 'moi' })}>{t('fiche.relais')}</button>}
          </div>
        )}
      </header>

      {erreur && <p className="message-erreur" role="alert"><CircleAlert size={18} aria-hidden="true" /> {tErreur(erreur)}</p>}

      {appel.confidentiel ? (
        <div className="bandeau-confidentiel" role="note">
          <ShieldAlert size={22} aria-hidden="true" />
          <div>
            <strong>{t('confidentiel.titre')}</strong>
            <p>{appel.consigne_confidentialite || t('fiche.confidentielDefaut')}</p>
          </div>
        </div>
      ) : null}

      <div className="grille-fiche">
        {/* Colonne principale : informations, transcription, historique */}
        <div className="colonne-principale">
          <section className="panneau panneau-padding">
            <h2 className="titre-section">{t('fiche.infos')}</h2>
            <dl className="infos">
              <dt>{t('col.telephone')}</dt>
              <dd><a href={`tel:${appel.telephone}`} className="telephone-fiche"><Phone size={17} aria-hidden="true" /> {appel.telephone}</a></dd>
              <dt>{t('col.courriel')}</dt><dd>{appel.courriel || <span className="texte-discret">—</span>}</dd>
              <dt>{t('col.motif')}</dt><dd>{appel.motif || <span className="texte-discret">—</span>}</dd>
              <dt>{t('col.langue')}</dt><dd>{t(`langue.${appel.langue}`)}</dd>
              <dt>{t('col.source')}</dt><dd>{t(`source.${appel.source}`)}</dd>
              <dt>{t('col.recuLe')}</dt><dd>{dateHeure(appel.recu_le)}</dd>
              <dt>{t('fiche.creePar')}</dt><dd>{appel.cree_par_nom}</dd>
            </dl>
          </section>

          {appel.transcription && (
            <section className="panneau panneau-padding">
              <h2 className="titre-section"><Voicemail size={18} aria-hidden="true" /> {t('nouvel.transcription')}</h2>
              <blockquote className="transcription">{appel.transcription}</blockquote>
            </section>
          )}

          <section className="panneau panneau-padding">
            <h2 className="titre-section"><History size={18} aria-hidden="true" /> {t('fiche.historique')}</h2>
            <ol className="historique">
              {actions.map((a) => (
                <li key={a.id}>
                  <Avatar nom={a.utilisateur_nom} petit />
                  <div>
                    <p className="quoi">{tAction(a.texte)}</p>
                    <p className="qui-quand"><span className="qui">{a.utilisateur_nom}</span> <time>{dateHeure(a.cree_le)}</time></p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Colonne de droite : le suivi */}
        <aside className="colonne-suivi">
          <section className="panneau panneau-padding">
            <h2 className="titre-section">{t('fiche.suivi')}</h2>
            <div className="champs-suivi">
              <div className="field">
                <label className="label is-small" htmlFor="statut">{t('col.statut')}</label>
                <div className="select is-fullwidth">
                  <select id="statut" value={appel.statut} onChange={(e) => modifier({ statut: e.target.value })}>
                    {Object.keys(STATUTS).map((v) => <option key={v} value={v}>{t(`statut.${v}`)}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="label is-small" htmlFor="service">{t('col.service')}</label>
                <div className="select is-fullwidth">
                  <select id="service" value={appel.service_id || ''} onChange={(e) => modifier({ service_id: e.target.value })}>
                    <option value="">{t('nouvel.aDeterminer')}</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {appel.archive
              ? <button className="button is-fullwidth" onClick={() => modifier({ archive: false })}><ArchiveRestore size={17} aria-hidden="true" /> <span>{t('fiche.desarchiver')}</span></button>
              : <button className="button is-fullwidth" onClick={() => modifier({ archive: true })}><Archive size={17} aria-hidden="true" /> <span>{t('fiche.archiver')}</span></button>}
          </section>

          <section className="panneau panneau-padding">
            <h2 className="titre-section">{t('fiche.noteRapide')}</h2>
            <div className="notes-rapides">
              {notes.map((n) => (
                <button key={n.id} aria-pressed={noteChoisie?.id === n.id}
                  className={`note${noteChoisie?.id === n.id ? ' est-choisie' : ''}`}
                  onClick={() => setNoteChoisie(noteChoisie?.id === n.id ? null : n)}>
                  <span>{n.texte}</span>
                  {n.statut_resultant && (
                    <span className={`resultat statut-${n.statut_resultant}`}>
                      <span className="pastille" aria-hidden="true" />{t(`statut.${n.statut_resultant}`)}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {noteChoisie && (
              <div className="complement">
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
          </section>

          <section className="panneau panneau-padding">
            <h2 className="titre-section"><label htmlFor="note-libre">{t('fiche.noteLibre')}</label></h2>
            <textarea id="note-libre" className="textarea" rows="3" placeholder={t('fiche.ecrire')}
              value={noteLibre} onChange={(e) => setNoteLibre(e.target.value)} />
            <button className="button is-primary is-outlined mt-3" disabled={!noteLibre.trim()}
              onClick={() => ajouterNote({ texte: noteLibre })}>
              <MessageSquarePlus size={17} aria-hidden="true" /> <span>{t('fiche.ajouterNote')}</span>
            </button>
          </section>
        </aside>
      </div>
    </>
  )
}
