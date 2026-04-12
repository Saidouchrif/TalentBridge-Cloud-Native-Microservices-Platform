# 🎨 Frontend TalentBridge

Interface utilisateur (React/Vite) permettant d'interagir avec les offres d'emploi, de suivre ses candidatures, et d'utiliser l'assistant IA de rédaction.

## 📌 Tâches implémentées (User Stories 7.2, 7.3 & 8.3)

### US 7.2 — Frontend Candidature
- **TCNMP-230 — UI postuler :** Formulaire de soumission finale (à connecter pleinement à la prévisualisation).
- **TCNMP-231 — UI suivi candidatures :** Page "Mes Candidatures" lister les demandes envoyées avec affichage des statuts via badges.

### US 7.3 — Docker + CI/CD (Phase 1)
- **TCNMP-232 — Docker config :** (À finaliser) Rédaction du Dockerfile Frontend.
- **TCNMP-233 — CI/CD :** Pipeline GitHub Actions (`frontend-cicd.yml`) configuré pour builder le frontend à chaque push.

### US 8.3 — Frontend IA
- **TCNMP-246 — UI génération CV & TCNMP-247 (Lettre) :** Implémentées dans `AiGeneratorPage.jsx`. Saisie des expériences et détails du poste pour générer le contenu.
- **TCNMP-248 — Bouton amélioration :** Composant isolé `AiImproveButton.jsx` appelant l'API pour ajuster le ton d'un texte pré-existant.

## 🚀 Lancement Rapide

1. Assurez-vous que l'API Gateway (Backend) tourne sur le port `5000` (`http://localhost:5000/api`).
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement Vite :
   ```bash
   npm run dev
   ```
4. Ouvrez `http://localhost:5173` dans votre navigateur.