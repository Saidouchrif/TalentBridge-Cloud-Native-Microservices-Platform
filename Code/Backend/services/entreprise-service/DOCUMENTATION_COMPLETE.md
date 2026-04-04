# TalentBridge - Entreprise Service

## 📋 Description

Le service `entreprise-service` est un microservice Node.js/Express qui gère les entreprises, les offres d'emploi et les candidatures dans l'écosystème TalentBridge.

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Base de données**: SQLite (développement) / PostgreSQL (production)
- **ORM**: Sequelize
- **Authentification**: JWT (désactivé en mode test)
- **Port**: 5002

### Frontend (React)
- **Framework**: React 18 avec hooks
- **Build tool**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router
- **Styling**: CSS-in-JS (inline styles)

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Git

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd entreprise-service

# Installer les dépendances backend
npm install

# Installer les dépendances frontend
cd frontend
npm install
cd ..
```

### Démarrage rapide (recommandé)
```bash
# Script automatisé qui configure tout
start-all.bat
```

### Démarrage manuel
```bash
# 1. Configurer et peupler la base de données
copy .env.sqlite .env
node.exe seed-sqlite.js

# 2. Démarrer le backend
node.exe src/server.js

# 3. Démarrer le frontend (dans un autre terminal)
cd frontend
npm run dev
```

## 🌐 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002
- **Health Check**: http://localhost:5002/health

## 📚 Documentation API

### Entreprises

#### Lister les entreprises
```http
GET /api/entreprises
```

#### Créer une entreprise
```http
POST /api/entreprises
Content-Type: application/json

{
  "name": "TechCorp Solutions",
  "sector": "Informatique",
  "description": "Entreprise spécialisée...",
  "addressLine1": "123 Avenue de la Technologie",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France",
  "phone": "+33 1 23 45 67 89",
  "website": "https://techcorp.fr"
}
```

#### Récupérer une entreprise
```http
GET /api/entreprises/{id}
```

#### Mettre à jour une entreprise
```http
PUT /api/entreprises/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "sector": "Updated Sector"
}
```

#### Supprimer une entreprise
```http
DELETE /api/entreprises/{id}
```

### Offres

#### Lister les offres d'une entreprise
```http
GET /api/entreprises/{enterpriseId}/offers
```

#### Créer une offre
```http
POST /api/entreprises/{enterpriseId}/offers
Content-Type: application/json

{
  "title": "Développeur Web Full Stack",
  "description": "Recherche développeur expérimenté...",
  "requiredSkills": ["JavaScript", "React", "Node.js"],
  "location": "Paris",
  "status": "published"
}
```

#### Supprimer une offre
```http
DELETE /api/entreprises/{enterpriseId}/offers/{offerId}
```

### Candidatures

#### Postuler à une offre
```http
POST /api/offers/{offerId}/applications
```

#### Lister les candidatures d'une entreprise
```http
GET /api/entreprises/{enterpriseId}/applications
```

#### Mettre à jour le statut d'une candidature
```http
PATCH /api/entreprises/{enterpriseId}/applications/{applicationId}
Content-Type: application/json

{
  "status": "accepted" // ou "rejected"
}
```

## 🗄️ Base de données

### Configuration SQLite (développement)
```env
DB_DIALECT=sqlite
SQLITE_STORAGE=./entreprise_db.sqlite
```

### Configuration PostgreSQL (production)
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=entreprise_db
```

### Modèles de données

#### Enterprise
```javascript
{
  id: INTEGER (PK),
  ownerUserId: STRING,
  name: STRING,
  sector: STRING,
  description: TEXT,
  addressLine1: STRING,
  city: STRING,
  postalCode: STRING,
  country: STRING,
  phone: STRING,
  website: STRING,
  created_at: DATE,
  updated_at: DATE
}
```

#### Offer
```javascript
{
  id: INTEGER (PK),
  enterpriseId: INTEGER (FK),
  title: STRING,
  description: TEXT,
  requiredSkills: JSON,
  location: STRING,
  status: ENUM('published', 'closed', 'draft'),
  publishedAt: DATE,
  created_at: DATE,
  updated_at: DATE
}
```

#### Application
```javascript
{
  id: INTEGER (PK),
  offerId: INTEGER (FK),
  studentUserId: STRING,
  status: ENUM('pending', 'accepted', 'rejected'),
  created_at: DATE,
  updated_at: DATE
}
```

## 🧪 Tests

### Tests Backend
```bash
# Installer les dépendances de test
npm install --save-dev supertest jest

# Exécuter les tests
npm test
```

### Tests Frontend
```bash
cd frontend
npm test
```

### Tests End-to-End
```bash
# Test des endpoints API
node test-endpoints.js
```

## 🔧 Configuration

### Variables d'environnement

```env
# Port du service
PORT=5002

# Configuration base de données
DB_DIALECT=sqlite
SQLITE_STORAGE=./entreprise_db.sqlite

# Configuration PostgreSQL (alternative)
# DB_DIALECT=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_NAME=entreprise_db

# JWT (non utilisé en mode test)
JWT_SECRET=supersecret

# CORS
CORS_ORIGIN=*
```

### Mode Test vs Production

**Mode Test (par défaut)**:
- Pas d'authentification JWT requise
- Base de données SQLite
- Utilisateur par défaut: `test-user-id`

**Mode Production**:
- Authentification JWT requise
- Base de données PostgreSQL
- Tokens JWT valides requis

## 🚀 Déploiement

### Docker
```bash
# Build
docker build -t entreprise-service .

# Run
docker run -p 5002:5002 entreprise-service
```

### Docker Compose
```bash
# Avec PostgreSQL
docker-compose up -d entreprise-postgres

# Démarrage complet
docker-compose up
```

### CI/CD
Le pipeline CI/CD est configuré via `.github/workflows/ci-cd.yml`:
- Tests automatiques sur push/PR
- Analyse de sécurité
- Build frontend
- Déploiement automatique sur main

## 📝 Scripts utiles

### Scripts de démarrage
- `start-all.bat` - Démarrage complet backend + frontend
- `start-sqlite.bat` - Démarrage avec SQLite
- `start-postgres.bat` - Démarrage avec PostgreSQL

### Scripts de diagnostic
- `fix-404.bat` - Réparation erreurs 404
- `fix-frontend.bat` - Configuration frontend
- `fix-req-user.bat` - Réparation erreurs req.user

### Scripts de données
- `seed-sqlite.js` - Peuplement base SQLite
- `seed-postgres.js` - Peuplement base PostgreSQL
- `test-endpoints.js` - Test tous les endpoints

## 🔍 Débogage

### Logs
```bash
# Logs backend
node.exe src/server.js

# Logs avec debug
DEBUG=* node.exe src/server.js
```

### Problèmes courants
1. **Erreur 404**: Vérifier que le backend tourne sur le port 5002
2. **req.user undefined**: Exécuter `fix-req-user.bat`
3. **Base de données vide**: Exécuter le seed approprié

## 🤝 Contribution

1. Forker le repository
2. Créer une branche feature
3. Commiter les changements
4. Pusher la branche
5. Créer une Pull Request

## 📄 License

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question ou problème:
- Créer une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation technique

---

**TalentBridge - Entreprise Service**  
*Gestion moderne des entreprises et offres d'emploi*
