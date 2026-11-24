// Tests de bout en bout : un vrai navigateur -> Vite -> Express -> MySQL. Rien n'est simulé.
// Avant la première fois : MySQL démarré (XAMPP), npm run db:init, puis npx playwright install chromium
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  workers: 1, // les tests partagent la même base de données
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1440, height: 900 },
    // Facultatif : utiliser un Chrome déjà installé (CHROME_PATH=chemin/vers/chrome)
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  },
  // Démarre le back-end et le front-end s'ils ne tournent pas déjà
  webServer: [
    { command: 'npm run dev --prefix ../backend', url: 'http://localhost:4000/api/sante', reuseExistingServer: true },
    { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
  ],
})
