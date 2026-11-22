// Libellés affichés à l'écran et petites fonctions de mise en forme.

export const STATUTS = {
  nouveau: { libelle: 'Nouveau', classe: 'is-danger' },
  en_cours: { libelle: 'En cours', classe: 'is-warning' },
  en_attente: { libelle: 'En attente', classe: 'is-info' },
  regle: { libelle: 'Réglé', classe: 'is-success' },
}

export const SOURCES = {
  boite_1: 'Boîte vocale 1',
  boite_2: 'Boîte vocale 2',
  boite_3: 'Boîte vocale 3',
  boite_4: 'Boîte vocale 4',
  reception: 'Réceptionniste',
}

export const LANGUES = {
  fr: 'Français',
  en: 'Anglais',
  es: 'Espagnol',
}

const formatDateHeure = new Intl.DateTimeFormat('fr-CA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function dateHeure(valeur) {
  if (!valeur) return ''
  return formatDateHeure.format(new Date(valeur))
}

// Pour le champ <input type="datetime-local"> : "2026-11-20T10:30"
export function maintenantLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
