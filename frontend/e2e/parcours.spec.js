// Parcours complets de l'équipe de la clinique, avec les comptes de démonstration.
import { expect, test } from '@playwright/test'

const MOT_DE_PASSE = 'Demo123!'

async function seConnecter(page, courriel) {
  await page.goto('/connexion')
  await page.getByLabel('Courriel').fill(courriel)
  await page.getByLabel('Mot de passe').fill(MOT_DE_PASSE)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByRole('heading', { name: 'Appels à traiter' })).toBeVisible()
  await expect(page.getByText('En direct')).toBeVisible() // Socket.io est connecté
}

test('un mauvais mot de passe est refusé', async ({ page }) => {
  await page.goto('/connexion')
  await page.getByLabel('Courriel').fill('reception@clinique.test')
  await page.getByLabel('Mot de passe').fill('mauvais')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByText('Courriel ou mot de passe incorrect')).toBeVisible()
})

test('un appel créé par la réception apparaît en direct chez l’infirmière', async ({ browser }) => {
  const nom = `Test E2E ${Date.now()}`
  // Deux personnes connectées en même temps, chacune dans son propre navigateur
  const reception = await (await browser.newContext()).newPage()
  const infirmiere = await (await browser.newContext()).newPage()
  await seConnecter(reception, 'reception@clinique.test')
  await seConnecter(infirmiere, 'infirmiere@clinique.test')

  // La réceptionniste crée une fiche confidentielle
  await reception.getByRole('link', { name: '+ Nouvel appel' }).first().click()
  await reception.getByLabel('Nom').fill(nom)
  await reception.getByLabel('Téléphone *').fill('819-555-0190')
  await reception.getByRole('button', { name: 'Anglais' }).click()
  await reception.getByText('La personne demande une mesure de confidentialité').click()
  await reception.getByLabel('Consigne').fill('Ne pas laisser de message')
  await reception.getByRole('button', { name: 'Créer la fiche' }).click()
  await expect(reception.getByText('Mesure de confidentialité demandée')).toBeVisible()

  // Sans rafraîchir, la ligne apparaît chez l'infirmière
  const ligne = infirmiere.getByRole('link', { name: nom })
  await expect(ligne).toBeVisible()

  // L'infirmière prend l'appel : la fiche de la réceptionniste se met à jour toute seule
  await ligne.click()
  await infirmiere.getByRole('button', { name: /Je m'en occupe/ }).click()
  await expect(reception.getByText('Marie Infirmière s\'occupe de cet appel')).toBeVisible()

  // Une note rapide avec un complément change le statut et s'ajoute à l'historique
  await infirmiere.getByRole('button', { name: /Message laissé sur la boîte vocale/ }).click()
  await infirmiere.getByLabel('Compléter (facultatif)').fill('lundi 9 h')
  await infirmiere.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(infirmiere.getByText('Message laissé sur la boîte vocale de rappeler lundi 9 h')).toBeVisible()
  await expect(infirmiere.getByText('Statut changé : En attente')).toBeVisible()
})

test('la recherche par numéro retrouve les anciens appels', async ({ page }) => {
  await seConnecter(page, 'infirmiere@clinique.test')
  await page.getByRole('link', { name: 'Archives et recherche' }).click()
  await page.getByLabel('Rechercher un numéro de téléphone ou un nom').fill('819 555-0142')
  await page.getByRole('button', { name: 'Rechercher' }).click()
  await expect(page.getByText(/appels? trouvés? pour « 819 555-0142 »/)).toBeVisible()
  expect(await page.locator('tbody tr').count()).toBeGreaterThanOrEqual(3)
})

test('le bouton EN met l’interface en anglais, et le choix est gardé', async ({ page }) => {
  await seConnecter(page, 'reception@clinique.test')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Calls to handle' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Calls to handle' })).toBeVisible()
  await page.getByRole('button', { name: 'FR', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Appels à traiter' })).toBeVisible()
})

test('seule l’administratrice voit la page Administration', async ({ page }) => {
  await seConnecter(page, 'reception@clinique.test')
  await expect(page.getByRole('link', { name: 'Administration' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Déconnexion' }).click()

  await seConnecter(page, 'admin@clinique.test')
  await page.getByRole('link', { name: 'Administration' }).click()
  await expect(page.getByText("Statut donné à l'appel")).toBeVisible()
})
