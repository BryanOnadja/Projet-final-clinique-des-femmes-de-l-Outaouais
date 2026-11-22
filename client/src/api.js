// Petit outil pour appeler l'API : ajoute le jeton et gère les erreurs.

export const getJeton = () => sessionStorage.getItem('jeton')

export async function api(chemin, { methode = 'GET', corps } = {}) {
  const jeton = getJeton()
  const reponse = await fetch(`/api${chemin}`, {
    method: methode,
    headers: {
      'Content-Type': 'application/json',
      ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
    },
    body: corps ? JSON.stringify(corps) : undefined,
  })

  const donnees = await reponse.json().catch(() => ({}))

  // Session expirée : retour à la page de connexion
  if (reponse.status === 401 && chemin !== '/auth/login') {
    sessionStorage.clear()
    window.location.href = '/connexion'
  }
  if (!reponse.ok) throw new Error(donnees.erreur || 'Une erreur est survenue')
  return donnees
}
