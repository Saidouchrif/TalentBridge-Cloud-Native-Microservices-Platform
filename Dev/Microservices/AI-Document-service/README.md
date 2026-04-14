# AI-Document-service (TalentBridge)

Microservice Node.js / Express : generation de **CV**, **lettre de motivation**, **email de candidature** et **adaptation d'un texte a une offre**, via **OpenAI + Gemini (fallback)**. Les documents sont enregistres en base PostgreSQL.

## Variables d'environnement

Ne jamais committer de cle API. Copier `.env.example` vers `.env` et renseigner :

| Variable | Role |
|----------|------|
| `PORT` | Port HTTP (defaut 8006) |
| `DATABASE_URL` | PostgreSQL (en Docker Compose, aligne sur `talentbridge_user` / `document_db`) |
| `JWT_SECRET` | Meme secret que le service Auth (validation du Bearer token) |
| `JWT_ALGORITHM` | Souvent `HS256` |
| `OPENAI_API_KEY` | Cle API OpenAI (prioritaire) |
| `OPENAI_MODEL` | Optionnel, defaut `gpt-4o-mini` |
| `GEMINI_API_KEY` | Cle API Google AI (Gemini, fallback) |
| `GEMINI_MODEL` | Optionnel, defaut `gemini-2.5-flash` |

## API (toutes les routes metier exigent `Authorization: Bearer <access_token>`)

### IA

- `POST /api/ai/generate-cv` - corps JSON : profil (nom, prenom, competences, experiences, formations, etc.)
- `POST /api/ai/generate-lettre` - contexte candidature + infos offre optionnelles
- `POST /api/ai/generate-email` - idem, format email (objet + corps)
- `POST /api/ai/adapt-offre` - `{ "contenu": "...", "offre": { "titre", "description", ... } }`

Reponse 201 : `{ id, type, contenu, dateGeneration }`

### Documents

- `GET /api/documents/me` - liste des documents de l'utilisateur connecte
- `DELETE /api/documents/:id` - suppression si le document appartient a l'utilisateur

### Sante

- `GET /sante`

## Docker

Service declare dans `Dev/docker-compose.yaml` sous `ai-document-service`, port **8006**.

## Erreurs

Les reponses d'erreur sont au format `{ "message": "..." }` (messages utilisateur, sans fuite de details techniques).
