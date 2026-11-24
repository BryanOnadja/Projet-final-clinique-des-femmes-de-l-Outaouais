// Tableau des appels actifs, mis à jour en direct pour toute l'équipe.
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth, useEvenement } from '../AuthContext'
import { STATUTS } from '../constantes'
import { useLangue } from '../i18n'
import { Cadenas, EtiquetteLangue, EtiquetteService, EtiquetteStatut } from '../components/Etiquettes'

const FILTRES_VIDES = { statut: '', service: '', langue: '', q: '' }

export default function Tableau() {
  const navigate = useNavigate()
  const { utilisateur } = useAuth()
  const { t, dateHeure } = useLangue()
  const [appels, setAppels] = useState([])
  const [services, setServices] = useState([])
  const [filtres, setFiltres] = useState(FILTRES_VIDES)
  const [chargement, setChargement] = useState(true)
  const [surbrillance, setSurbrillance] = useState(null)
  const [avis, setAvis] = useState('')

  const charger = useCallback(async () => {
    const params = new URLSearchParams(Object.entries(filtres).filter(([, v]) => v))
    setAppels(await api(`/appels?${params}`))
    setChargement(false)
  }, [filtres])

  useEffect(() => { charger() }, [charger])
  useEffect(() => { api('/services').then(setServices) }, [])

  // Temps réel : on recharge la liste dès qu'un appel change, chez tout le monde
  useEvenement(['appel:cree', 'appel:modifie'], ({ appel }, evenement) => {
    charger()
    setSurbrillance(appel.id)
    setTimeout(() => setSurbrillance(null), 2500)
    if (evenement === 'appel:cree' && appel.cree_par !== utilisateur.id) {
      setAvis(t('tableau.avisNouvel', { nom: appel.nom_appelant || appel.telephone }))
      setTimeout(() => setAvis(''), 4000)
    }
  })
  useEvenement('configuration:modifiee', () => api('/services').then(setServices))

  const changer = (cle) => (e) => setFiltres({ ...filtres, [cle]: e.target.value })
  const compte = (statut) => appels.filter((a) => a.statut === statut).length

  return (
    <>
      {avis && <div className="notification is-link is-light avis-flottant" role="status">{avis}</div>}

      <div className="level mb-4">
        <div className="level-left">
          <div>
            <h1 className="title is-4 mb-1">{t('tableau.titre')}</h1>
            <p className="has-text-grey">{t('tableau.actifs', { n: appels.length })}</p>
          </div>
        </div>
        <div className="level-right">
          <Link to="/nouvel-appel" className="button is-primary">{t('nav.nouvel')}</Link>
        </div>
      </div>

      {/* Compteurs par statut : un clic filtre la liste */}
      <div className="compteurs mb-4">
        {['nouveau', 'en_cours', 'en_attente'].map((s) => (
          <button key={s}
            className={`compteur ${STATUTS[s]}${filtres.statut === s ? ' est-choisi' : ''}`}
            onClick={() => setFiltres({ ...filtres, statut: filtres.statut === s ? '' : s })}>
            <span className="nombre">{filtres.statut && filtres.statut !== s ? '·' : compte(s)}</span>
            <span>{t(`statut.${s}`)}</span>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="box filtres">
        <div className="columns is-variable is-2 is-multiline">
          <div className="column is-4">
            <input className="input" type="search" placeholder={t('filtre.recherche')}
              value={filtres.q} onChange={changer('q')} aria-label={t('filtre.rechercheLabel')} />
          </div>
          <div className="column">
            <div className="select is-fullwidth">
              <select value={filtres.statut} onChange={changer('statut')} aria-label={t('filtre.statut')}>
                <option value="">{t('filtre.tousStatuts')}</option>
                {['nouveau', 'en_cours', 'en_attente'].map((s) => <option key={s} value={s}>{t(`statut.${s}`)}</option>)}
              </select>
            </div>
          </div>
          <div className="column">
            <div className="select is-fullwidth">
              <select value={filtres.service} onChange={changer('service')} aria-label={t('filtre.service')}>
                <option value="">{t('filtre.tousServices')}</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
          </div>
          <div className="column">
            <div className="select is-fullwidth">
              <select value={filtres.langue} onChange={changer('langue')} aria-label={t('filtre.langue')}>
                <option value="">{t('filtre.toutesLangues')}</option>
                <option value="fr">{t('langue.fr')}</option>
                <option value="en">{t('langue.en')}</option>
                <option value="es">{t('langue.es')}</option>
              </select>
            </div>
          </div>
          <div className="column is-narrow">
            <button className="button is-light" onClick={() => setFiltres(FILTRES_VIDES)}>{t('filtre.effacer')}</button>
          </div>
        </div>
      </div>

      {/* Liste des appels */}
      <div className="table-container box p-0">
        <table className="table is-fullwidth is-hoverable tableau-appels">
          <thead>
            <tr>
              <th>{t('col.recuLe')}</th>
              <th>{t('col.appelante')}</th>
              <th>{t('col.telephone')}</th>
              <th>{t('col.motif')}</th>
              <th>{t('col.langue')}</th>
              <th>{t('col.source')}</th>
              <th>{t('col.service')}</th>
              <th>{t('col.statut')}</th>
              <th>{t('col.prisPar')}</th>
            </tr>
          </thead>
          <tbody>
            {appels.map((a) => (
              <tr key={a.id}
                className={`${a.id === surbrillance ? 'ligne-flash' : ''} ${a.statut === 'nouveau' ? 'ligne-nouvelle' : ''}`}
                onClick={() => navigate(`/appels/${a.id}`)}>
                <td className="is-nowrap">{dateHeure(a.recu_le)}</td>
                <td className="is-nowrap">
                  <Link to={`/appels/${a.id}`} className="has-text-weight-semibold is-nowrap" onClick={(e) => e.stopPropagation()}>
                    {a.nom_appelant || t('tableau.nomInconnu')}
                  </Link>{' '}
                  {a.confidentiel ? <Cadenas /> : null}
                </td>
                <td className="is-nowrap">{a.telephone}</td>
                <td className="motif">
                  {a.confidentiel
                    ? <em className="has-text-grey">{t('tableau.motifConfidentiel')}</em>
                    : a.motif}
                </td>
                <td><EtiquetteLangue langue={a.langue} /></td>
                <td className="is-nowrap">{t(`source.${a.source}`)}</td>
                <td><EtiquetteService nom={a.service_nom} couleur={a.service_couleur} /></td>
                <td><EtiquetteStatut statut={a.statut} /></td>
                <td className="is-nowrap">{a.pris_en_charge_nom || <span className="has-text-grey-light">{t('tableau.personne')}</span>}</td>
              </tr>
            ))}
            {!chargement && appels.length === 0 && (
              <tr><td colSpan="9" className="has-text-centered has-text-grey py-6">{t('tableau.vide')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
