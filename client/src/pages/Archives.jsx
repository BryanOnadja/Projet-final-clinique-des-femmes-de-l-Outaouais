// Archives + recherche par numéro de téléphone (tous les appels liés à un numéro).
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { SOURCES, dateHeure } from '../constantes'
import { Cadenas, EtiquetteLangue, EtiquetteService, EtiquetteStatut } from '../components/Etiquettes'

export default function Archives() {
  const navigate = useNavigate()
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
      <h1 className="title is-4">Archives et recherche</h1>

      <form className="box" onSubmit={soumettre}>
        <label className="label" htmlFor="recherche">Rechercher un numéro de téléphone ou un nom</label>
        <div className="field has-addons">
          <div className="control is-expanded">
            <input id="recherche" className="input is-medium" type="search" placeholder="Ex. : 819 555-0142"
              value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>
          <div className="control">
            <button className="button is-primary is-medium" type="submit">Rechercher</button>
          </div>
        </div>
        <p className="help">La recherche couvre les appels actifs et archivés, même anciens.</p>
      </form>

      <p className="mb-3 has-text-grey">
        {rechercheFaite
          ? `${appels.length} appel${appels.length > 1 ? 's' : ''} trouvé${appels.length > 1 ? 's' : ''} pour « ${rechercheFaite} »`
          : `${appels.length} appels archivés, du plus récent au plus ancien`}
      </p>

      <div className="table-container box p-0">
        <table className="table is-fullwidth is-hoverable tableau-appels">
          <thead>
            <tr>
              <th>Reçu le</th><th>Appelante</th><th>Téléphone</th><th>Langue</th><th>Source</th>
              <th>Service</th><th>Statut</th><th>Dernière action</th>
            </tr>
          </thead>
          <tbody>
            {appels.map((a) => (
              <tr key={a.id} onClick={() => navigate(`/appels/${a.id}`)}>
                <td className="is-nowrap">{dateHeure(a.recu_le)}</td>
                <td className="has-text-weight-semibold">{a.nom_appelant || 'Nom inconnu'} {a.confidentiel ? <Cadenas /> : null}</td>
                <td className="is-nowrap">{a.telephone}</td>
                <td><EtiquetteLangue langue={a.langue} /></td>
                <td className="is-nowrap">{SOURCES[a.source]}</td>
                <td><EtiquetteService nom={a.service_nom} couleur={a.service_couleur} /></td>
                <td>
                  <EtiquetteStatut statut={a.statut} />{' '}
                  {a.archive ? <span className="tag is-dark is-light">Archivé</span> : null}
                </td>
                <td className="motif has-text-grey">{a.derniere_action}</td>
              </tr>
            ))}
            {appels.length === 0 && (
              <tr><td colSpan="8" className="has-text-centered has-text-grey py-6">Aucun appel trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
