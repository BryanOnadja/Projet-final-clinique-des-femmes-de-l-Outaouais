// Petites étiquettes colorées réutilisées partout.
import { LANGUES, STATUTS } from '../constantes'

export function EtiquetteStatut({ statut }) {
  const s = STATUTS[statut] || { libelle: statut, classe: '' }
  return <span className={`tag ${s.classe} is-light has-text-weight-semibold`}>{s.libelle}</span>
}

export function EtiquetteService({ nom, couleur }) {
  if (!nom) return <span className="has-text-grey-light">—</span>
  return (
    <span className="tag service" style={{ borderColor: couleur, color: couleur }}>
      <span className="pastille" style={{ background: couleur }} />
      {nom}
    </span>
  )
}

export function EtiquetteLangue({ langue }) {
  return <span className={`tag langue langue-${langue}`} title={LANGUES[langue]}>{langue.toUpperCase()}</span>
}

export function Cadenas() {
  return <span className="cadenas" title="Mesure de confidentialité demandée" aria-label="Confidentiel">🔒</span>
}
