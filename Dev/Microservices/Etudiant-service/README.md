# Etudiant-service (TalentBridge)

Microservice **Node.js + Express** qui gère le profil étudiant (données personnelles, expériences, formations, compétences, langues). Il s’intègre au **service Auth** via **JWT** : aucune inscription ici, seulement vérification du jeton et du rôle `etudiant`.

## Rôle du service

- Création et mise à jour du **profil étudiant** après inscription côté Auth.
- Gestion des sous-ressources liées au compte via **`user_id`** (pas de clé étrangère vers la table utilisateurs : architecture microservices).
- Refus d’accès aux fonctionnalités tant que le profil n’est pas créé.

## Architecture

```text
src/
??? config/db.js           # Sequelize + création auto de la base si absente
??? controllers/           # Logique HTTP + validation Joi
??? models/                # Un fichier Sequelize par table
??? routes/                # Routeurs + index.js
??? middlewares/
?   ??? auth.middleware.js # JWT + rôle étudiant + profil obligatoire
?   ??? error.middleware.js# Réponses d’erreur sans fuite technique
??? utils/validation.js    # Validation centralisée (messages génériques)
??? app.js                 # Application Express (sans listen)

server.js                  # Point d’entrée : sync DB + écoute du port
tests/                     # Jest + Supertest
```

## Prérequis

- Node.js **18+**
- PostgreSQL **15+** (ou conteneur Docker)
- Un **JWT** émis par **Auth-User-service** avec les champs `user_id`, `role`, `exp`
- **`JWT_SECRET`** identique à **`SECRET_KEY`** du service Auth

## Variables d’environnement (`.env`)

| Variable        | Description                                      |
|-----------------|--------------------------------------------------|
| `PORT`          | Port HTTP (défaut `8001`)                        |
| `DATABASE_URL`  | URL PostgreSQL (base dédiée, ex. `etudiant_db`)   |
| `JWT_SECRET`    | Même secret que `SECRET_KEY` côté Auth           |
| `JWT_ALGORITHM` | Optionnel, défaut `HS256`                        |

## Routes API

Préfixe : **`/api/etudiant`**. Toutes les routes (sauf création de profil) exigent un profil existant.

| Méthode | Chemin | Description |
|---------|--------|-------------|
| GET | `/sante` | Santé du service (sans auth) |
| POST | `/api/etudiant/profile` | Créer le profil (auth étudiant) |
| GET | `/api/etudiant/me` | Lire le profil |
| PUT | `/api/etudiant/me` | Mettre à jour le profil |
| POST | `/api/etudiant/experience` | Ajouter une expérience |
| GET | `/api/etudiant/experience` | Lister les expériences |
| DELETE | `/api/etudiant/experience/:id` | Supprimer une expérience |
| POST | `/api/etudiant/formation` | Ajouter une formation |
| GET | `/api/etudiant/formation` | Lister les formations |
| POST | `/api/etudiant/competence` | Ajouter une compétence |
| GET | `/api/etudiant/competence` | Lister les compétences |
| POST | `/api/etudiant/langue` | Ajouter une langue |
| GET | `/api/etudiant/langue` | Lister les langues |

En-tête requis : `Authorization: Bearer <access_token>`.

## Exemples JSON

**Création de profil** — `POST /api/etudiant/profile`

```json
{
  "universite": "Université Paris Cité",
  "niveau": "Master 2",
  "cv": "https://example.com/mon-cv.pdf",
  "localisation": "Paris, France"
}
```

**Mise à jour profil** — `PUT /api/etudiant/me`

```json
{
  "localisation": "Lyon, France",
  "niveau": "Doctorat"
}
```

**Expérience** — `POST /api/etudiant/experience`

```json
{
  "poste": "Stagiaire développeur",
  "entreprise": "TechCorp",
  "dateDebut": "2024-06-01",
  "dateFin": "2024-08-31",
  "description": "API REST, Node.js"
}
```

**Formation** — `POST /api/etudiant/formation`

```json
{
  "etablissement": "Université X",
  "diplome": "Licence informatique",
  "dateDebut": "2020-09-01",
  "dateFin": "2023-06-30"
}
```

**Compétence** — `POST /api/etudiant/competence`

```json
{
  "nom": "TypeScript",
  "niveau": "Intermédiaire"
}
```

**Langue** — `POST /api/etudiant/langue`

```json
{
  "nom": "Anglais",
  "niveau": "C1"
}
```

## Lancer en local

```bash
cd Dev/Microservices/Etudiant-service
cp .env .env.local   # adapter DATABASE_URL et JWT_SECRET
npm install
npm run dev          # nodemon server.js
```

Production locale :

```bash
npm start            # node server.js
```

## Lancer avec Docker (stack TalentBridge)

Depuis `Dev/` :

```bash
docker compose up -d postgres etudiant-service
```

Le compose surcharge `DATABASE_URL` pour utiliser l’utilisateur PostgreSQL du projet. Alignez **`JWT_SECRET`** dans `.env` sur **`SECRET_KEY`** d’Auth.

## Tests

**PostgreSQL doit tourner** (par ex. `docker compose up -d postgres` depuis `Dev/`). Le port **5432** doit être joignable depuis ta machine (`localhost`).

Sans variable `TEST_DATABASE_URL`, Jest lit **`DATABASE_URL` dans le fichier `.env`** : l’hôte `postgres` / `postgres_db` est remplacé par **`127.0.0.1`**, le nom de base devient **`etudiant_test`** (créée automatiquement si besoin), en gardant le même utilisateur et mot de passe que dans `.env`.

```powershell
cd Dev/Microservices/Etudiant-service
npm test
```

Optionnel — forcer une URL (CI, autre port) :

```powershell
$env:TEST_DATABASE_URL = "postgresql://talentbridge_user:talentbridge_password@127.0.0.1:5432/etudiant_test"
npm test
```

**Si tu vois « PostgreSQL indisponible pour les tests » :**

1. Démarre Postgres : `cd Dev` puis `docker compose up -d postgres`.
2. Supprime une ancienne URL de test erronée : `Remove-Item Env:TEST_DATABASE_URL` (PowerShell).
3. Vérifie que le `.env` contient les **mêmes identifiants** que le conteneur (`talentbridge_user` / `talentbridge_password` avec la stack par défaut).

Le fichier `tests/jest.setup.js` exécute `sync({ force: true })` sur **`etudiant_test` uniquement** (pas sur `etudiant_db`).

## CI/CD

Le workflow **`.github/workflows/etudiant-service.yml`** exécute sur les changements sous `Dev/Microservices/Etudiant-service` (ou `Code/...`) :

1. `npm ci`
2. `npm test` (PostgreSQL de service)
3. `docker build`

## Tables (Sequelize)

- `etudiants` — profil (contrainte unique sur `user_id`)
- `experiences`, `formations`, `competences`, `langues` — toutes avec `user_id`, sans FK vers Auth

## Gestion des erreurs (résumé)

- Les entrées invalides renvoient **`400`** avec `{ "message": "Les données envoyées sont invalides" }` (pas de détail technique).
- Le middleware global transforme les erreurs Sequelize et les erreurs inattendues en messages génériques, **sans pile ni SQL** dans la réponse JSON.
