# Matching-service (TalentBridge)

Calcule un **score de compatibilite** (0-100) entre profils etudiants et offres, en s'appuyant sur les microservices **Etudiant**, **Offres** et **Candidature**.

## Formule

| Composante | Poids | Principe |
|------------|-------|----------|
| Competences | 50 % | Mots-cles de `competencesRequises` (offre) vs competences (nom + niveau) de l'etudiant |
| Localisation | 20 % | Meme ville / chevauchement de tokens (profil vs offre) |
| Experience | 30 % | Duree cumulee des experiences (dates debut / fin) |

Les resultats sont **tries par score decroissant** et limites aux **10** meilleurs.

## Routes

- `GET /api/matching/offres` - **etudiant** (JWT). Retourne `[{ offre_id, score }, ...]`.
- `GET /api/matching/candidats/:offre_id` - **entreprise** (JWT), offre proprietaire. Retourne `[{ user_id, score }, ...]`.

Sante : `GET /sante`

## Variables d'environnement

Voir `.env.example`. `MATCHING_SERVICE_TOKEN` doit etre identique sur **etudiant-service** pour l'endpoint interne `GET /api/etudiant/service/users/:user_id/matching-profile`.

## Modele `matchings`

Chaque execution remplace les lignes precedentes pour la cle concernee (etudiant : par `user_id` ; entreprise : par `offre_id` pour les candidats retournes).
