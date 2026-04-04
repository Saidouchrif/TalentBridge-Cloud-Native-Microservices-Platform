# entreprise-service (microservice Entreprise)

Microservice Express/Sequelize qui gère :

- Les entreprises (CRUD)
- Les offres de stage publiées par une entreprise
- Les candidatures d'étudiants à ces offres (et le changement de statut par l'entreprise)

> Le service est autonome : il ne modifie aucun autre microservice existant et expose ses fonctionnalités via une API REST.

## Prérequis

- Node.js 20+
- PostgreSQL (en production) ou SQLite (mode tests)
- Un token JWT valide signé par le service `auth-service` (en supposant le même `JWT_SECRET`)

## Variables d'environnement

Le fichier exemple se trouve dans `./.env.example`.

Variables principales :

- `PORT` : port HTTP (par défaut `5002`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` : connexion DB
- `DB_DIALECT` : `postgres` (défaut) ou `sqlite` (tests)
- `JWT_SECRET` : secret JWT partagé avec `auth-service`
- `CORS_ORIGIN` : origine autorisée CORS

## Démarrage local (sans Docker)

1. Installer les dépendances backend :
   - `npm install`
2. Démarrer le serveur :
   - `npm start`

Le serveur expose :

- `GET /health`
- `GET/POST/PUT/DELETE /api/...` (endpoints ci-dessous)

## Démarrage local (Docker Compose)

- `docker compose up -d --build`

Puis test :

- `http://localhost:5002/health`

## API REST

### Entreprises

- `GET /api/entreprises` : liste (publique)
- `GET /api/entreprises/:enterpriseId` : détail (publique)
- `POST /api/entreprises` : création (protégé JWT)
- `PUT /api/entreprises/:enterpriseId` : modification (protégé JWT)
- `DELETE /api/entreprises/:enterpriseId` : suppression (protégé JWT)

### Offres

Lecture (publique) :

- `GET /api/entreprises/:enterpriseId/offers` : offres d'une entreprise
- `GET /api/offers?status=published` : offres filtrées
- `GET /api/offers/:offerId` : détail

Gestion (protégé JWT) :

- `POST /api/entreprises/:enterpriseId/offers` : créer une offre
- `PUT /api/entreprises/:enterpriseId/offers/:offerId` : modifier une offre
- `DELETE /api/entreprises/:enterpriseId/offers/:offerId` : supprimer une offre

### Candidatures

Étudiant (protégé JWT) :

- `POST /api/offers/:offerId/applications` : candidate à une offre

Entreprise (protégé JWT) :

- `GET /api/entreprises/:enterpriseId/applications` : liste des candidatures
- `PATCH /api/entreprises/:enterpriseId/applications/:applicationId` :
  met à jour le statut (`accepted` / `rejected`)

## Notes de sécurité (pratiques)

- Les routes protégées exigent un header `Authorization: Bearer <token>`
- Le service valide uniquement la signature JWT (le rôle n'est pas strictement utilisé ici car `auth-service` ne le fournit pas encore dans le payload)

## Déploiement Kubernetes (manifestes inclus)

Les fichiers se trouvent dans `./k8s/` :

- `deployment.yaml`
- `service.yaml`

Vous devrez fournir l’image Docker dans votre registre et brancher les variables DB via `ConfigMap`/`Secret` (non inclus ici pour rester autonome).

