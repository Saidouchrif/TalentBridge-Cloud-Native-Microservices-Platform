# TalentBridge — Candidature-service

Microservice Node.js (Express + Sequelize + **axios**) pour les candidatures étudiants aux offres.

## Prérequis

- PostgreSQL
- **Offres-service** joignable (`OFFRES_SERVICE_URL`)
- Même **`JWT_SECRET`** (et algorithme) que le service Auth
- **`SERVICE_INTERNAL_TOKEN`** identique entre Candidature-service et Offres-service (compteur `nombreCandidatures`)

## Variables d'environnement

Copier `.env.example` vers `.env` et adapter.

| Variable | Description |
|----------|-------------|
| `PORT` | Port HTTP (défaut 8003) |
| `DATABASE_URL` | Connexion PostgreSQL (base `application_db` recommandée) |
| `JWT_SECRET` | Secret JWT Auth |
| `JWT_ALGORITHM` | Souvent `HS256` |
| `OFFRES_SERVICE_URL` | URL du Offres-service (ex. `http://localhost:8002` ou `http://offres-service:8002` en Docker) |
| `SERVICE_INTERNAL_TOKEN` | Jeton partagé pour `POST /api/offres/:id/increment-candidatures` |

## Scripts

```bash
npm install
npm run dev
```

## Routes API

### Étudiant (JWT + rôle `etudiant`)

- `POST /api/candidatures` — corps : `{ "offre_id": number, "message"?: string, "cv"?: string }`
- `GET /api/candidatures/me` — liste des candidatures de l'étudiant connecté

### Entreprise (JWT + rôle `entreprise`)

- `GET /api/candidatures/offre/:offre_id` — candidatures pour une offre **dont l'entreprise est propriétaire**
- `PUT /api/candidatures/:id/statut` — corps : `{ "statut": "accepte" \| "refuse" }` (uniquement si statut actuel `en_attente`)

### Santé

- `GET /sante`

## Modèle `Application` (table `applications`)

- Pas de clés étrangères en base : `user_id` et `offre_id` sont des entiers.
- Contrainte d'unicité `(user_id, offre_id)` : une seule candidature par étudiant et par offre.
- `updatedAt` (Sequelize) correspond à la mise à jour métier côté API.

## Intégration Offres-service

1. Avant création : `GET {OFFRES_SERVICE_URL}/api/offres/:id` pour vérifier l'existence et le statut (`actif` requis).
2. Après création réussie : `POST {OFFRES_SERVICE_URL}/api/offres/:id/increment-candidatures` avec en-tête `X-Service-Token: SERVICE_INTERNAL_TOKEN`.

En cas d'échec du compteur, la candidature est annulée (rollback logique).
