// Valeurs utilisées dans toute l'app. Les libellés affichés sont dans i18n.jsx.

// Statuts d'un appel et couleur Bulma de leur étiquette
export const STATUTS = {
  nouveau: 'is-danger',
  en_cours: 'is-warning',
  en_attente: 'is-info',
  regle: 'is-success',
}

export const SOURCES = ['boite_1', 'boite_2', 'boite_3', 'boite_4', 'reception']

export const LANGUES = ['fr', 'en', 'es']

// Pour le champ <input type="datetime-local"> : "2026-11-20T10:30"
export function maintenantLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
