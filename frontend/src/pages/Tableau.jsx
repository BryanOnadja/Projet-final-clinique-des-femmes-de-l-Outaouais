// Tableau des appels actifs, mis à jour en direct pour toute l'équipe.
import { useEffect, useState } from 'react'
import { Bell, CircleCheck, PhoneIncoming, Search, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useEvenement } from '../hooks/tempsReel'
import { FILTRES_VIDES, fetchAppels, filtreModifie } from '../store/appelsSlice'
import { fetchConfiguration } from '../store/configurationSlice'
import { useLangue } from '../i18n'
import { Cadenas, EtiquetteLangue, EtiquetteService, EtiquetteStatut } from '../components/Etiquettes'

export default function Tableau() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // État global (Redux) : liste des appels, filtres, services, personne connectée
  const { items: appels, filtres, status } = useSelector((state) => state.appels)
  const services = useSelector((state) => state.configuration.services)
  const utilisateur = useSelector((state) => state.auth.utilisateur)
  const { t, dateHeure } = useLangue()
  // État local : seulement pour l'affichage de ce composant
  const [surbrillance, setSurbrillance] = useState(null)
  const [avis, setAvis] = useState('')
  const chargement = status !== 'succeeded'
  const [maintenant, setMaintenant] = useState(() => Date.now())

  // Le temps d'attente se met à jour chaque minute
  useEffect(() => {
    const minuterie = setInterval(() => setMaintenant(Date.now()), 60000)
    return () => clearInterval(minuterie)
  }, [])

  // Recharge la liste quand un filtre envoyé au serveur change (pas le statut, filtré à l'écran)
  const { service, langue, q } = filtres
  useEffect(() => { dispatch(fetchAppels()) }, [service, langue, q, dispatch])
  useEffect(() => { dispatch(fetchConfiguration()) }, [dispatch])

  const setFiltres = (nouveaux) =>
    Object.entries(nouveaux).forEach(([cle, valeur]) => {
      if (filtres[cle] !== valeur) dispatch(filtreModifie({ cle, valeur }))
    })

  // Temps réel : on recharge la liste dès qu'un appel change, chez tout le monde
  useEvenement(['appel:cree', 'appel:modifie'], ({ appel }, evenement) => {
    dispatch(fetchAppels())
    setSurbrillance(appel.id)
    setTimeout(() => setSurbrillance(null), 2500)
    if (evenement === 'appel:cree' && appel.cree_par !== utilisateur.id) {
      setAvis(t('tableau.avisNouvel', { nom: appel.nom_appelant || appel.telephone }))
      setTimeout(() => setAvis(''), 4000)
    }
  })
  useEvenement('configuration:modifiee', () => dispatch(fetchConfiguration()))

  const changer = (cle) => (e) => setFiltres({ [cle]: e.target.value })
  const compte = (statut) => appels.filter((a) => a.statut === statut).length
  const affiches = filtres.statut ? appels.filter((a) => a.statut === filtres.statut) : appels
  const filtreActif = filtres.service || filtres.langue || filtres.q

  // Temps d'attente depuis l'appel : la couleur change avec l'ancienneté
  const attente = (recuLe) => {
    const minutes = Math.max(0, Math.round((maintenant - new Date(recuLe).getTime()) / 60000))
    const niveau = minutes < 60 ? 'recente' : minutes < 240 ? 'moyenne' : 'longue'
    return { texte: t('duree', { minutes }), niveau }
  }

  const onglets = [
    { valeur: '', libelle: t('filtre.tous'), nombre: appels.length },
    ...['nouveau', 'en_cours', 'en_attente'].map((s) => ({ valeur: s, libelle: t(`statut.${s}`), nombre: compte(s) })),
  ]

  return (
    <>
      {avis && (
        <div className="avis-flottant" role="status">
          <Bell size={18} aria-hidden="true" /> {avis}
        </div>
      )}

      <header className="entete-page">
        <div>
          <h1 className="titre-page">{t('tableau.titre')}</h1>
          <p className="sous-titre-page">{t('tableau.actifs', { n: appels.length })}</p>
        </div>
        <Link to="/nouvel-appel" className="button is-primary">
          <PhoneIncoming size={18} aria-hidden="true" /> <span>{t('nav.nouvel')}</span>
        </Link>
      </header>

      {/* Onglets de statut : filtrent la liste et donnent les compteurs */}
      <div className="onglets-statut" role="tablist" aria-label={t('filtre.statut')}>
        {onglets.map((o) => (
          <button key={o.valeur || 'tous'} role="tab" aria-selected={filtres.statut === o.valeur}
            className={`onglet${filtres.statut === o.valeur ? ' est-actif' : ''}${o.valeur ? ` onglet-${o.valeur}` : ''}`}
            onClick={() => setFiltres({ statut: o.valeur })}>
            {o.valeur && <span className="pastille" aria-hidden="true" />}
            {o.libelle}
            <span className="nombre">{o.nombre}</span>
          </button>
        ))}
      </div>

      <div className="panneau">
        {/* Filtres */}
        <div className="barre-filtres">
          <div className="control has-icons-left recherche">
            <input className="input" type="search" placeholder={t('filtre.recherche')}
              value={filtres.q} onChange={changer('q')} aria-label={t('filtre.rechercheLabel')} />
            <span className="icon is-left"><Search size={17} aria-hidden="true" /></span>
          </div>
          <div className="select">
            <select value={filtres.service} onChange={changer('service')} aria-label={t('filtre.service')}>
              <option value="">{t('filtre.tousServices')}</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
          <div className="select">
            <select value={filtres.langue} onChange={changer('langue')} aria-label={t('filtre.langue')}>
              <option value="">{t('filtre.toutesLangues')}</option>
              <option value="fr">{t('langue.fr')}</option>
              <option value="en">{t('langue.en')}</option>
              <option value="es">{t('langue.es')}</option>
            </select>
          </div>
          {filtreActif && (
            <button className="button is-white bouton-effacer" onClick={() => setFiltres({ ...FILTRES_VIDES, statut: filtres.statut })}>
              <X size={16} aria-hidden="true" /> <span>{t('filtre.effacer')}</span>
            </button>
          )}
        </div>

        {/* Liste des appels */}
        <div className="table-container">
          <table className="table is-fullwidth is-hoverable tableau-appels">
            <thead>
              <tr>
                <th>{t('col.attente')}</th>
                <th>{t('col.appelante')}</th>
                <th>{t('col.motif')}</th>
                <th>{t('col.langue')}</th>
                <th>{t('col.service')}</th>
                <th>{t('col.statut')}</th>
                <th>{t('col.prisPar')}</th>
              </tr>
            </thead>
            <tbody>
              {affiches.map((a) => {
                const { texte, niveau } = attente(a.recu_le)
                return (
                  <tr key={a.id} className={a.id === surbrillance ? 'ligne-flash' : ''}
                    onClick={() => navigate(`/appels/${a.id}`)}>
                    <td className="is-nowrap">
                      <span className={`attente attente-${niveau}`} title={dateHeure(a.recu_le)}>{texte}</span>
                      <span className="source">{t(`source.${a.source}`)}</span>
                    </td>
                    <td className="is-nowrap">
                      <Link to={`/appels/${a.id}`} className="nom-appelante" onClick={(e) => e.stopPropagation()}>
                        {a.nom_appelant || t('tableau.nomInconnu')}
                      </Link>{' '}
                      {a.confidentiel ? <Cadenas /> : null}
                      <span className="telephone">{a.telephone}</span>
                    </td>
                    <td className="motif">
                      {a.confidentiel
                        ? <span className="texte-discret">{t('tableau.motifConfidentiel')}</span>
                        : a.motif}
                    </td>
                    <td><EtiquetteLangue langue={a.langue} /></td>
                    <td><EtiquetteService nom={a.service_nom} couleur={a.service_couleur} /></td>
                    <td className="is-nowrap"><EtiquetteStatut statut={a.statut} /></td>
                    <td className="is-nowrap">
                      {a.pris_en_charge_nom || <span className="texte-discret">{t('tableau.personne')}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!chargement && affiches.length === 0 && (
            <div className="etat-vide">
              <CircleCheck size={40} strokeWidth={1.6} aria-hidden="true" />
              <p className="etat-vide-titre">{t('tableau.vide')}</p>
              <p>{t('tableau.videAide')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
