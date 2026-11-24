// Logo de l'application : une bulle d'appel avec une coche (un appel suivi jusqu'au bout).
export default function Logo({ taille = 32 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 32 32" aria-hidden="true" className="logo">
      <path
        d="M7 3.5h18A4.5 4.5 0 0 1 29.5 8v12a4.5 4.5 0 0 1-4.5 4.5H15l-6.5 5v-5H7A4.5 4.5 0 0 1 2.5 20V8A4.5 4.5 0 0 1 7 3.5z"
        fill="var(--framboise)"
      />
      <path d="M10 14.2l4 4 8-8.2" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Initiales dans un cercle (personne connectée, historique)
export function Avatar({ nom, petit = false }) {
  const initiales = (nom || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((m) => m[0])
    .join('')
    .toUpperCase()
  return (
    <span className={`avatar${petit ? ' avatar-petit' : ''}`} aria-hidden="true">
      {initiales}
    </span>
  )
}
