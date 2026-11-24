// Petites étiquettes réutilisées partout.
import { Lock } from 'lucide-react'
import { useLangue } from '../i18n'

// Statut : une pastille de couleur + le mot (la couleur n'est jamais seule à porter le sens)
export function EtiquetteStatut({ statut }) {
  const { t } = useLangue()
  return (
    <span className={`pilule statut-${statut}`}>
      <span className="pastille" aria-hidden="true" />
      {t(`statut.${statut}`)}
    </span>
  )
}

export function EtiquetteService({ nom, couleur }) {
  if (!nom) return <span className="texte-discret">—</span>
  return (
    <span className="service">
      <span className="pastille" style={{ background: couleur }} aria-hidden="true" />
      {nom}
    </span>
  )
}

export function EtiquetteLangue({ langue }) {
  const { t } = useLangue()
  return <span className="langue" title={t(`langue.${langue}`)}>{langue.toUpperCase()}</span>
}

export function Cadenas() {
  const { t } = useLangue()
  return (
    <span className="cadenas" title={t('confidentiel.titre')} aria-label={t('confidentiel.court')} role="img">
      <Lock size={14} strokeWidth={2.4} aria-hidden="true" />
    </span>
  )
}
