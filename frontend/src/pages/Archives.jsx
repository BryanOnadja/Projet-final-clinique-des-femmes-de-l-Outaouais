// Archives + recherche par numéro de téléphone (tous les appels liés à un numéro).
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SearchX } from 'lucide-react'
import appelsService from '../services/appelsService'
import { useLangue } from '../i18n'
import { Cadenas, EtiquetteLangue, EtiquetteService, EtiquetteStatut } from '../components/Etiquettes'

export default function Archives() {
  const navigate = useNavigate()
  const { t, tAction, dateHeure } = useLangue()
  const [recherche, setRecherche] = useState('')
  const [rechercheFaite, setRechercheFaite] = useState('')
  const [appels, setAppels] = useState([])

  // Sans recherche : derniers appels archivés. Avec recherche : TOUS les appels de ce numéro.
  async function charger(texte) {
    const filtres = texte ? { archive: 'tous', q: texte } : { archive: '1' }
    setAppels(await appelsService.lister(filtres))
    setRechercheFaite(texte)
  }

  useEffect(() => { charger('') }, [])

  function soumettre(e) {
    e.preventDefault()
    charger(recherche.trim())
  }

  return (
    <>
      <header className="entete-page">
        <h1 className="titre-page">{t('archives.titre')}</h1>
      </header>

      <form className="panneau panneau-padding recherche-archives" onSubmit={soumettre}>
        <label className="label" htmlFor="recherche">{t('archives.label')}</label>
        <div className="field has-addons">
          <div className="control is-expanded has-icons-left">
            <span className="icon is-left"><Search size={19} aria-hidden="true" /></span>
            <input id="recherche" className="input is-medium" type="search" placeholder={t('archives.exemple')}
              value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>
          <div className="control">
            <button className="button is-primary is-medium" type="submit">{t('archives.bouton')}</button>
          </div>
        </div>
        <p className="help">{t('archives.aide')}</p>
      </form>

      <p className="resume-resultats">
        {rechercheFaite
          ? t('archives.trouves', { n: appels.length, q: rechercheFaite })
          : t('archives.recents', { n: appels.length })}
      </p>

      <div className="panneau table-container">
        <table className="table is-fullwidth is-hoverable tableau-appels">
          <thead>
            <tr>
              <th>{t('col.recuLe')}</th><th>{t('col.appelante')}</th><th>{t('col.langue')}</th>
              <th>{t('col.service')}</th><th>{t('col.statut')}</th><th>{t('col.derniereAction')}</th>
            </tr>
          </thead>
          <tbody>
            {appels.map((a) => (
              <tr key={a.id} onClick={() => navigate(`/appels/${a.id}`)}>
                <td className="is-nowrap">
                  {dateHeure(a.recu_le)}
                  <span className="source">{t(`source.${a.source}`)}</span>
                </td>
                <td className="is-nowrap">
                  <span className="nom-appelante">{a.nom_appelant || t('tableau.nomInconnu')}</span> {a.confidentiel ? <Cadenas /> : null}
                  <span className="telephone">{a.telephone}</span>
                </td>
                <td><EtiquetteLangue langue={a.langue} /></td>
                <td><EtiquetteService nom={a.service_nom} couleur={a.service_couleur} /></td>
                <td className="is-nowrap">
                  <EtiquetteStatut statut={a.statut} />{' '}
                  {a.archive ? <span className="pilule pilule-neutre">{t('fiche.archive')}</span> : null}
                </td>
                <td className="motif texte-discret">{tAction(a.derniere_action)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {appels.length === 0 && (
          <div className="etat-vide">
            <SearchX size={40} strokeWidth={1.6} aria-hidden="true" />
            <p className="etat-vide-titre">{t('archives.vide')}</p>
          </div>
        )}
      </div>
    </>
  )
}
