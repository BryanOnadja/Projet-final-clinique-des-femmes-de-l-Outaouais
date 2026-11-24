// Petites étiquettes colorées réutilisées partout.
import { STATUTS } from '../constantes'
import { useLangue } from '../i18n'

export function EtiquetteStatut({ statut }) {
  const { t } = useLangue()
  return <span className={`tag ${STATUTS[statut] || ''} is-light has-text-weight-semibold`}>{t(`statut.${statut}`)}</span>
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
  const { t } = useLangue()
  return <span className={`tag langue langue-${langue}`} title={t(`langue.${langue}`)}>{langue.toUpperCase()}</span>
}

export function Cadenas() {
  const { t } = useLangue()
  return <span className="cadenas" title={t('confidentiel.titre')} aria-label={t('confidentiel.court')}>🔒</span>
}
