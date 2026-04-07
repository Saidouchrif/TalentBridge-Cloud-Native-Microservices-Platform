# TalentBridge - Cloud Native Microservices Platform

Bienvenue dans le backend de la plateforme **TalentBridge**. Ce projet est structuré selon une architecture microservices utilisant Node.js, Express, Sequelize (PostgreSQL) et l'intégration de l'API Google Gemini.

Ce dépôt contient plusieurs services, dont les deux principaux sont le **Candidature Service** et le **AI Document Service**.

---

## 📋 Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé les éléments suivants sur votre machine :
- [Node.js](https://nodejs.org/) (version 16 ou supérieure recommandée)
- [PostgreSQL](https://www.postgresql.org/) (installé et en cours d'exécution)
- Une clé API valide depuis [OpenAI](https://platform.openai.com/)

---

## 🚀 Installation et Démarrage

Puisqu'il s'agit de microservices, vous devez ouvrir **deux terminaux distincts** pour faire tourner les deux services simultanément sur votre machine locale.

### 1. Service Candidature (`candidature-service`)
Ce service gère les offres d'emploi (Jobs) et les candidatures (Applications) et communique avec la base de données PostgreSQL.

**Étape 1 :** Ouvrez votre terminal et naviguez vers le dossier du service :
```bash
cd Backend/services/candidature-service
```

**Étape 2 :** Installez les dépendances nécessaires :
```bash
npm install
```

**Étape 3 :** Créez un fichier `.env` à la racine de ce service avec vos accès PostgreSQL :
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=votre_mot_de_passe_postgres
DB_NAME=talentbridge_db
PORT=3001
```

**Étape 4 :** Lancez le service :
```bash
npm start
```
*(Note : Les tables de la base de données se synchroniseront automatiquement grâce à `sequelize.sync({ alter: true })`).*

---

### 2. Service IA Documents (`ai-document-service`)
Ce service communique avec l'IA de Google (Gemini) pour améliorer des lettres de motivation ou restructurer les compétences sur un CV.

**Étape 1 :** Ouvrez un **nouveau terminal** et naviguez vers le dossier :
```bash
cd Backend/services/ai-document-service
```

**Étape 2 :** Installez les dépendances :
```bash
npm install
```

**Étape 3 :** Créez un fichier `.env` et ajoutez votre clé API OpenAI :
```env
OPENAI_API_KEY=sk-votre_cle_api_openai_ici
PORT=3002
```

**Étape 4 :** Lancez le service :
```bash
npm start
```

---

## 🛠️ Aperçu des Endpoints de l'API

### Candidature Service (Gestion des Offres)
- `GET /jobs` : Récupérer toutes les offres d'emploi (triées par ID décroissant).
- `GET /jobs/:id` : Récupérer les détails d'une offre d'emploi spécifique.
- `POST /jobs` : Créer une nouvelle offre d'emploi. *(Champs requis : title, company, description)*.
- `PUT /jobs/:id` : Mettre à jour une offre existante.
- `DELETE /jobs/:id` : Supprimer une offre d'emploi.

### AI Document Service (Amélioration par IA)
- `POST /improveText` : Améliore le texte envoyé selon son type.
  - **Body attendu (JSON)** : 
    ```json
    { 
      "text": "Le texte du CV ou de la lettre...", 
      "type": "coverLetter" // ou "skills"
    }
    ```