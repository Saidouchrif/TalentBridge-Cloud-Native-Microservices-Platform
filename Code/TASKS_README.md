# 📋 Documentation des Tâches (US 7 & US 8)

Ce document sert de README pour chacune des tâches (TCNMP) liées au moteur de candidature et à l'intégration de l'IA.

## 📌 US 7.1 — Backend Candidature

- **TCNMP-227 — Modèle Application :** Création du schéma de base de données PostgreSQL (tables candidatures, relations utilisateurs/documents).
  - *Implémentation :* Les modèles `Application`, `Job` et `Document` sont définis et synchronisés via Sequelize dans `Models/index.js`.
- **TCNMP-228 — Endpoint postuler :** API `POST /api/apply` pour enregistrer une candidature.
  - *Implémentation :* Pris en charge par la méthode `createApplication` dans `applicationController.js`. Côté frontend, c'est branché via `submitApplication` dans `api.js`.
- **TCNMP-229 — Gestion statut :** Mise à jour des statuts via `PUT /api/status/:id`.
  - *Implémentation :* Méthode `updateStatus` implémentée dans `applicationController.js` (qui utilise plutôt le verbe `PATCH` selon les standards REST).

## 📌 US 7.2 — Frontend Candidature

- **TCNMP-230 — UI postuler :** Formulaire de soumission finale avec prévisualisation des documents IA.
  - *Implémentation :* UI à finaliser, mais la connexion à l'API est prête.
- **TCNMP-231 — UI suivi candidatures :** Page "Mes Candidatures" pour lister les demandes et afficher le statut.
  - *Implémentation :* Excellente intégration dans `MyApplications.jsx` avec des statistiques en temps réel et un système de badges de statuts (DesignerBadge).

## 📌 US 7.3 — Docker + CI/CD (Phase 1)

- **TCNMP-232 — Docker config :** Rédaction des Dockerfiles pour les microservices.
  - *Implémentation :* À créer à la racine de chaque microservice (Backend/Frontend).
- **TCNMP-233 — CI/CD :** Configuration GitHub Actions.
  - *Implémentation :* Fichier `frontend-cicd.yml` déployé pour automatiser le build Node.js (v18) et préparer la construction de l'image Docker à chaque push.

## 📌 US 8.1 — Intégration IA

- **TCNMP-239 — Setup API :** Configuration sécurisée des clés d'API.
  - *Implémentation :* Bien que la spec d'origine mentionne OpenAI, le choix technique s'est porté sur Google Gemini (`@google/generative-ai`) configuré via `GEMINI_API_KEY` dans `AiController.js`.
- **TCNMP-240 — Génération CV :** Prompt et logique pour générer un CV.
  - *Implémentation :* Logique implémentée dans `generateDocument` (AiController.js) avec un `systemPrompt` spécialisé en rédaction de CV.
- **TCNMP-241 — Génération lettre :** Rédaction automatique de lettres de motivation.
  - *Implémentation :* Géré via la condition `type === 'coverLetter'` dans le même contrôleur.
- **TCNMP-242 — Génération email :** Outil pour rédiger des emails d'accompagnement.
  - *Implémentation :* Géré via la condition `type === 'email'`.

## 📌 US 8.2 — Backend Documents

- **TCNMP-243 — Modèle Document :** Définition de l'entité Document.
  - *Implémentation :* Modèle prêt et synchronisé par Sequelize dans l'API de candidature.
- **TCNMP-244 — Stockage documents :** Persistance des textes générés.
  - *Implémentation :* Méthode `saveDocument` (applicationController.js) enregistre le type, le contenu et lie l'ID du candidat.
- **TCNMP-245 — Historique :** Endpoint pour récupérer les anciens documents.
  - *Implémentation :* Méthode `getDocumentHistory` implémentée, récupérant les documents triés du plus récent au plus ancien.

## 📌 US 8.3 — Frontend IA

- **TCNMP-246 — UI génération CV :** Page avec champs de saisie et bouton de génération.
  - *Implémentation :* Regroupé intelligemment dans `AiGeneratorPage.jsx` via le mode `generate`.
- **TCNMP-247 — UI génération lettre :** Interface de saisie des détails du poste.
  - *Implémentation :* Fonctionnel dans `AiGeneratorPage.jsx` avec le type `coverLetter`.
- **TCNMP-248 — Bouton amélioration :** Ajuster le ton d'un document existant.
  - *Implémentation :* Composant `AiImproveButton` relié au mode `improve` appelant l'API `/improveText`.

## 📌 US 8.4 — Docker + CI/CD (Phase 2)

- **TCNMP-249 — Dockerfile :** Image Docker pour `ai-document-service`.
  - *Implémentation :* Reste à implémenter.
- **TCNMP-250 — Secure API keys :** Secret management pour protéger la clé en production.
  - *Implémentation :* L'application utilise correctement `process.env.GEMINI_API_KEY` protégé via `.env` en local, prêt pour les secrets Docker/GitHub en production.