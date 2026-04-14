# Notification-service (TalentBridge)

Service Node.js / Express : emails (Nodemailer) et notifications in-app (PostgreSQL + Sequelize).

## Fonctionnalites

- **Nouvelle offre** : email + ligne `notifications` pour chaque etudiant (via `AUTH_SERVICE_ADMIN_TOKEN` + `GET /api/utilisateurs/`, ou corps `recipients`).
- **Nouvelle candidature** : email + notification pour l’entreprise proprietaire de l’offre.
- **Changement de statut** : email + notification pour l’etudiant.

## Configuration

Copier `.env.example` vers `.env` et renseigner au minimum :

- `DATABASE_URL` : aligne sur `docker-compose` (`talentbridge_user` / `notification_db`).
- `SECRET_KEY` : identique au service Auth (validation JWT).
- `SMTP_*` : identifiants Gmail (mot de passe d’application).
- `NOTIFICATION_INTERNAL_TOKEN` : meme valeur que sur **offres-service** et **candidature-service** (`X-Service-Token`).
- `AUTH_SERVICE_ADMIN_TOKEN` : jeton Bearer d’un utilisateur **admin** Auth, pour lister les etudiants lors du POST `new-offre` sans `recipients`.

## API

| Methode | Route | Auth |
|--------|--------|------|
| GET | `/api/notifications/me` | JWT utilisateur |
| PATCH | `/api/notifications/:id/read` | JWT utilisateur |
| POST | `/api/notifications/new-offre` | `X-Service-Token` |
| POST | `/api/notifications/new-candidature` | `X-Service-Token` |
| POST | `/api/notifications/status-update` | `X-Service-Token` |

Sante : `GET /sante`

## Reponse cloche (frontend)

`GET /api/notifications/me` renvoie un tableau d’objets avec notamment `message`, `lu`, `id`, `type`, `created_at`.

## Integration

- **offres-service** : apres creation d’une offre, appel asynchrone vers `new-offre`.
- **candidature-service** : apres candidature et apres mise a jour du statut, appels vers `new-candidature` et `status-update`.

Ne pas commiter `.env` (secrets SMTP et jeton admin).
