# 🤖 AI Document Service

Ce microservice est dédié à la connexion aux services d'intelligence artificielle (Google Gemini) pour automatiser la rédaction et l'amélioration de documents (CV, Lettres, Emails).

## 📌 Tâches implémentées (User Stories 8.1 & 8.4)

### US 8.1 — Intégration IA
- **TCNMP-239 — Setup API :** Configuration sécurisée du SDK `@google/generative-ai` via la clé d'environnement `GEMINI_API_KEY`.
- **TCNMP-240 — Génération CV :** Endpoint `POST /generate` utilisant un prompt spécialisé pour structurer un profil en CV.
- **TCNMP-241 — Génération lettre :** Logique conditionnelle pour rédiger des lettres de motivation percutantes selon le type `coverLetter`.
- **TCNMP-242 — Génération email :** Génération d'emails d'accompagnement courts via le type `email`.

### US 8.4 — Docker + CI/CD (Phase 2)
- **TCNMP-249 — Dockerfile :** (À faire) Finalisation de l'image Docker pour ce service.
- **TCNMP-250 — Secure API keys :** Utilisation des variables d'environnement (`process.env.GEMINI_API_KEY`) pour protéger les clés en production.

## 🚀 Lancement Rapide

1. Créez un fichier `.env` à la racine de ce service :
   ```bash
   GEMINI_API_KEY=votre_cle_api_google_ici
   PORT=3002
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Démarrez le service :
   ```bash
   npm start
   ```
   Le service exposera les routes `/improve` et `/generate`.