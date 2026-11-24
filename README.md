# Suivi des appels – Clinique des femmes de l'Outaouais

Prototype réalisé dans le cadre du cours **SED 2515 – Applications web et mobile** (Université d'Ottawa).

L'application regroupe en un seul endroit les messages des 4 boîtes vocales et les appels pris par la réceptionniste. Toute l'équipe voit **en direct** qui s'occupe de quel appel et ce qui a déjà été fait.

> ⚠️ **Toutes les données sont fictives.** N'entrez jamais de vraies informations de clientes dans ce prototype.

![Tableau des appels](docs/captures/tableau.jpg)

## Fonctionnalités

- Connexion par courriel et mot de passe (mots de passe chiffrés, session de 8 h, déconnexion après 30 min d'inactivité)
- Création d'une fiche d'appel : source (boîte vocale 1 à 4 ou réceptionniste), nom, téléphone, motif, langue (FR/EN/ES), date et heure, transcription du message vocal
- Mesure de confidentialité : cadenas 🔒 dans la liste, motif masqué, consigne bien visible sur la fiche
- **Temps réel** (Socket.io) : les nouveaux appels et les changements apparaissent chez tout le monde sans rafraîchir
- Bouton **« Je m'en occupe »** pour éviter que deux personnes rappellent la même cliente
- **Notes rapides** en un clic (à compléter au besoin) + notes libres ; chaque note change le statut si nécessaire
- Historique complet : qui a fait quoi, et quand
- Statuts : Nouveau, En cours, En attente, Réglé ; un appel réglé part aux archives
- Filtres par statut, service (avec couleurs) et langue
- **Recherche par numéro de téléphone** dans tous les appels, même anciens
- Administration : modifier les notes rapides, les services et leurs couleurs, les comptes de l'équipe
- **Interface bilingue** : bouton **FR / EN** dans la barre du haut (et sur la page de connexion), mémorisé sur chaque ordinateur. Les notes rapides et les noms des services restent dans la langue où l'administratrice les a écrits.

![Interface en anglais](docs/captures/tableau-en.jpg)

| Fiche d'un appel | Recherche par numéro |
| --- | --- |
| ![Fiche](docs/captures/fiche.jpg) | ![Recherche](docs/captures/recherche.jpg) |

## Technologies

| Partie | Outils |
| --- | --- |
| Front-end | React 19 (Vite), Redux Toolkit, Axios, React Router, Bulma CSS, socket.io-client |
| Back-end | Node.js, Express (modèle MVC, modules ES), Socket.io, jsonwebtoken, bcryptjs |
| Base de données | MySQL (mysql2) – fonctionne avec XAMPP |
| Tests | Vitest, Testing Library, Playwright, Postman |

## Installation (à faire une seule fois)

**Prérequis :** [Node.js](https://nodejs.org) 20 ou plus, et MySQL démarré (dans XAMPP : bouton *Start* à côté de MySQL).

```bash
# 1. Installer les dépendances (racine, backend et frontend)
npm run setup

# 2. Créer le fichier de configuration du serveur
#    Windows :     copy backend\.env.example backend\.env
#    Mac / Linux : cp backend/.env.example backend/.env
#    Puis ouvrez backend/.env et changez JWT_SECRET (et DB_PASSWORD si besoin)

# 3. Créer la base de données avec les données fictives
npm run db:init
```

## Lancer l'application

```bash
npm run dev
```

Ouvrez **http://localhost:5173** (le front-end). Le back-end tourne sur le port 4000 ; Vite lui transmet les requêtes `/api` et `/socket.io`.

### Comptes de démonstration

Mot de passe pour tous : **`Demo123!`**

| Courriel | Rôle |
| --- | --- |
| `admin@clinique.test` | Administratrice |
| `reception@clinique.test` | Réceptionniste |
| `infirmiere@clinique.test` | Infirmière |
| `intervenante@clinique.test` | Intervenante |

### Voir le temps réel

1. Connectez-vous avec `reception@clinique.test` dans une fenêtre normale.
2. Connectez-vous avec `infirmiere@clinique.test` dans une **fenêtre de navigation privée**.
3. Créez un appel d'un côté : il apparaît tout de suite de l'autre.

Pour remettre les données à zéro : `npm run db:init`.

## Structure du projet

Le projet suit l'organisation vue dans les labos du cours : un dossier **`frontend/`** (React) et un dossier **`backend/`** (Express, en MVC).

```
clinique-appels/
├── frontend/                      Front-end : React (Vite) + Redux Toolkit + Axios + Bulma
│   ├── src/
│   │   ├── pages/                 Connexion, Tableau, NouvelAppel, Fiche, Archives, Admin
│   │   ├── components/            Navigation, étiquettes (statut, service, langue)
│   │   ├── services/              api.js (instance Axios), authService, appelsService,
│   │   │                          configurationService, socket.js (Socket.io)
│   │   ├── store/                 store.js + slices Redux : authSlice, appelsSlice, configurationSlice
│   │   ├── hooks/tempsReel.js     Temps réel et déconnexion automatique
│   │   ├── i18n.jsx               Textes français et anglais + bouton FR/EN
│   │   └── test/                  Configuration des tests Vitest
│   ├── e2e/parcours.spec.js       Tests de bout en bout (Playwright)
│   └── playwright.config.js
├── backend/                       Back-end : Express (MVC) + MySQL + Socket.io
│   ├── index.js                   Point d'entrée
│   ├── config/Database.js         Connexion MySQL (mysql2)
│   ├── models/                    Requêtes SQL : AppelModel, ActionModel, NoteRapideModel,
│   │                              ServiceModel, UtilisateurModel
│   ├── controllers/               Règles de gestion : AppelController, AuthController,
│   │                              ConfigurationController
│   ├── routes/                    URL de l'API : AppelRoutes, AuthRoutes, ConfigurationRoutes
│   ├── middleware/auth.js         Jetons JWT et droits (connexion, admin)
│   ├── socket/tempsReel.js        Socket.io
│   ├── db/schema.sql              Les 5 tables
│   ├── db/seed.js                 Crée la base et les données fictives
│   └── tests/                     Collection Postman
└── docs/captures/                 Captures d'écran
```

Le chemin d'une requête : **page React → service Axios → route Express → contrôleur → modèle → MySQL**, puis la réponse remonte, et Socket.io prévient les autres écrans.

## Tests

| Type | Outil | Commande | Ce qui est vérifié |
| --- | --- | --- | --- |
| Tests unitaires | Vitest + Testing Library | `npm test` | Reducers Redux (appels, connexion), étiquettes FR/EN, écran de connexion avec le service simulé |
| Tests de bout en bout | Playwright | `npm run test:e2e` | Connexion, temps réel entre deux personnes, prise en charge, notes rapides, recherche par numéro, bouton FR/EN, droits admin |
| Tests d'API | Postman (ou cURL) | Importer `backend/tests/clinique-appels.postman_collection.json` | 17 requêtes, statuts 200, 201, 400, 401 et 404 |

Avant les tests de bout en bout (une seule fois) : MySQL démarré, `npm run db:init`, puis `npx playwright install chromium` dans `frontend/`.

Exemples cURL :

```bash
# Connexion : copiez le "jeton" de la réponse
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"courriel":"admin@clinique.test","mot_de_passe":"Demo123!"}'

# Liste des appels actifs
curl http://localhost:4000/api/appels -H "Authorization: Bearer VOTRE_JETON"
```

## API

Toutes les routes, sauf la connexion, demandent l'en-tête `Authorization: Bearer <jeton>`.

| Méthode | Route | Rôle |
| --- | --- | --- |
| POST | `/api/auth/login` | Connexion, renvoie un jeton |
| GET | `/api/appels?statut=&service=&langue=&archive=0\|1\|tous&q=` | Liste filtrée ; `q` = numéro ou nom |
| POST | `/api/appels` | Créer une fiche |
| GET | `/api/appels/:id` | Fiche + historique |
| PATCH | `/api/appels/:id` | Statut, service, prise en charge (`"moi"` ou `null`), archive, informations |
| POST | `/api/appels/:id/actions` | Note rapide (`note_rapide_id` + `texte` facultatif) ou note libre (`texte`) |
| GET / POST / PATCH | `/api/notes-rapides` | Notes rapides (modification : admin) |
| GET / POST / PATCH | `/api/services` | Services (modification : admin) |
| GET / POST / PATCH | `/api/utilisateurs` | Comptes (admin seulement) |

Événements Socket.io envoyés par le serveur : `appel:cree`, `appel:modifie`, `configuration:modifiee`.

## Sécurité

- Mots de passe hachés avec bcrypt, jamais stockés en clair
- Jetons JWT signés, valides 8 h ; Socket.io refuse les connexions sans jeton
- Requêtes SQL paramétrées (protection contre l'injection SQL)
- Secrets dans `backend/.env`, exclu de Git
- Rôles : seules les administratrices modifient la configuration et les comptes

Pour une vraie mise en service, la clinique devra choisir l'hébergement des données avec sa personne responsable des renseignements personnels.

## Mettre le projet sur GitHub

```bash
git init
git add .
git commit -m "Premier prototype du suivi des appels"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/clinique-appels.git
git push -u origin main
```

Vérifiez avant chaque `git push` que `backend/.env` n'apparaît **pas** dans `git status`.

## Utilisation de l'IA générative

Comme l'exige le cours, l'utilisation de l'IA est documentée dans [IA.md](IA.md).
