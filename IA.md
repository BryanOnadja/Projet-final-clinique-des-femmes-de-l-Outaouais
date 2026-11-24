# Utilisation de l'IA générative

Le plan de cours de SED 2515 demande d'indiquer à quoi l'IA a servi, les prompts exacts et leurs dates.
Ajoutez une entrée à chaque nouvelle utilisation.

| Date | Outil | Utilisé pour | Prompt exact |
| --- | --- | --- | --- |
| 2026-11-15 | Claude | Plan de projet détaillé (étapes, rôles, architecture, calendrier) | « donne moi un plan detailler de ce que on doit faire de A a Z pour que ce soit fonctionnel et quon puisse presenter a la clinique » |
| 2026-11-15 | Claude | Calendrier refait jusqu'à la présentation du 9 décembre | « on doit peresenter le prototype final le 9 decembre donc laisse toute les dates que tu vois la » |
| 2026-11-20 | Claude | User stories du projet | « Les User Stories • Une User Story décrit un besoin du point de vue de l'utilisateur. En tant que [utilisateur] Je veux [objectif] Afin de [bénéfice]. je veux que tu me donnes la user stories du projet » |
| 2026-11-20 | Claude | Première version du code (front-end React, back-end Express, base MySQL, Socket.io) | « puis qur tu as deja tout le plan et tout je veux du visel... donne moi alors le front end back end je vais faire un depot sur gitub et voir le fnctionnement » |
| 2026-11-23 | Claude | Bouton FR/EN et traduction anglaise de l'interface | « es ce que l'application peut etre mise en anglais? » puis « oui un bouton » |
| 2026-11-23 | Claude | Réorganisation selon les supports du cours (frontend/ et backend/, MVC, Axios, Redux Toolkit) et tests (Vitest, Playwright, Postman) | « lapplication doit avoir un frontend et un backend regarde les cours qui sont dans le dossier Sed2515 » puis « oui » |
| 2026-11-23 | Claude | Refonte visuelle : logo, couleurs, police, icônes à la place des émojis, barre latérale | « je veux quon modifie l'apparence de l'application je veux que ca ait l'air dune vrai application professionnelle avec les couleurs bien choisi et les logos bien jolie  et meme les emoticones je veux quils soient bien pro » |

## Ce que l'équipe a vérifié et compris

À compléter par l'équipe avant l'oral : chaque membre doit pouvoir expliquer avec ses mots chaque fichier (voir la structure dans le README).

- [ ] `backend/models/*` – requêtes SQL et jointures
- [ ] `backend/controllers/*` – règles de gestion (statuts, historique, notes rapides)
- [ ] `backend/routes/*` et `backend/middleware/auth.js` – URL de l'API, bcrypt, JWT, droits
- [ ] `backend/socket/tempsReel.js` et `frontend/src/hooks/tempsReel.js` – Socket.io
- [ ] `frontend/src/store/*` – Redux Toolkit (slices, thunks)
- [ ] `frontend/src/services/*` – Axios
- [ ] `frontend/src/i18n.jsx` – traductions et bouton FR/EN
- [ ] `frontend/src/pages/*` – écrans React
- [ ] Tests : `frontend/src/**/*.test.*`, `frontend/e2e/`, `backend/tests/`
