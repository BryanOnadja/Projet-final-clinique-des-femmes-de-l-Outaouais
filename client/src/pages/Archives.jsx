// Archives + recherche par numéro de téléphone (tous les appels liés à un numéro).
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
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
    const params = texte ? `archive=tous&q=${encodeURIComponent(texte)}` : 'archive=1'
    setAppels(await api(`/appels?${params}`))
    setRechercheFaite(texte)
  }

  useEffect(() => { charger('') }, [])

  function soumettre(e) {
    e.preventDefault()
    charger(recherche.trim())
  }

  return (
    <>
      <h1 className="title is-4">{t('archives.titre')}</h1>

      <form className="box" onSubmit={soumettre}>
        <label className="label" htmlFor="recherche">{t('archives.label')}</label>
        <div className="field has-addons">
          <div className="control is-expanded">
            <input id="recherche" className="input is-medium" type="search" placeholder={t('archives.exemple')}
              value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>
          <div className="control">
            <button className="button is-primary is-medium" type="submit">{t('archives.bouton')}</button>
          </div>
        </div>
        <p className="help">{t('archives.aide')}</p>
      </form>

      <p className="mb-3 has-text-grey">
        {rechercheFaite
          ? t('archives.trouves', { n: appels.length, q: rechercheFaite })
          : t('archives.recents', { n: appels.length })}
      </p>

      <div className="table-container box p-0">
        <table className="table is-fullwidth is-hoverable tableau-appels">
          <thead>
            <tr>
              <th>{t('col.recuLe')}</th><th>{t('col.appelante')}</th><th>{t('col.telephone')}</th><th>{t('col.langue')}</th><th>{t('col.source')}</th>
              <th>{t('col.service')}</th><th>{t('col.statut')}</th><th>{t('col.derniereAction')}</th>
            </tr>
          </thead>
          <tbody>
            {appels.map((a) => (
              <tr key={a.id} onClick={() => navigate(`/appels/${a.id}`)}>
                <td className="is-nowrap">{dateHeure(a.recu_le)}</td>
                <td className="has-text-weight-semibold">{a.nom_appelant || t('tableau.nomInconnu')} {a.confidentiel ? <Cadenas /> : null}</td>
                <td className="is-nowrap">{a.telephone}</td>
                <td><EtiquetteLangue langue={a.langue} /></td>
                <td className="is-nowrap">{t(`source.${a.source}`)}</td>
                <td><EtiquetteService nom={a.service_nom} couleur={a.service_couleur} /></td>
                <td>
                  <EtiquetteStatut statut={a.statut} />{' '}
                  {a.archive ? <span className="tag is-dark is-light">{t('fiche.archive')}</span> : null}
                </td>
                <td className="motif has-text-grey">{tAction(a.derniere_action)}</td>
              </tr>
            ))}
            {appels.length === 0 && (
              <tr><td colSpan="8" className="has-text-centered has-text-grey py-6">{t('archives.vide')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
