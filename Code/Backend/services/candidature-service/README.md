# 📄 Candidature Service

Ce microservice gère le moteur de gestion des candidatures et le stockage de l'historique des documents générés par l'IA.

## 📌 Tâches implémentées (User Stories 7.1 & 8.2)

### US 7.1 — Backend Candidature
- **TCNMP-227 — Modèle Application :** Création du schéma de base de données PostgreSQL via Sequelize. Les modèles `Application`, `Job` et `Document` sont liés entre eux.
- **TCNMP-228 — Endpoint postuler :** Endpoint `POST /api/apply` (ou `/applications`) pour enregistrer une nouvelle candidature.
- **TCNMP-229 — Gestion statut :** Mise à jour des statuts (En attente, Sélectionné, Refusé) via `PATCH /applications/:id/status`.

### US 8.2 — Backend Documents
- **TCNMP-243 — Modèle Document :** Entité `Document` (Type, Contenu textuel, Date de création, CandidateId) définie.
- **TCNMP-244 — Stockage documents :** Méthode `saveDocument` (`POST /candidatures/documents`) pour la persistance des textes générés par l'IA.
- **TCNMP-245 — Historique :** Endpoint `GET /candidatures/history` pour récupérer les anciens documents triés du plus récent au plus ancien.

## 🚀 Lancement Rapide

1. Copiez le fichier d'environnement et configurez les identifiants PostgreSQL :
   ```bash
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASS=votre_mot_de_passe
   DB_NAME=talentbridge_db
   PORT=3001
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Démarrez le service (les tables Sequelize se synchroniseront automatiquement) :
   ```bash
   npm start
   ```