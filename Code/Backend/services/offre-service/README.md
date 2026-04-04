# TalentBridge - Offre Service

## 📋 Description

Le service `offre-service` est un microservice Node.js/Express qui gère les offres d'emploi et les candidatures dans l'écosystème TalentBridge. Il communique avec le service `entreprise-service` via des API REST.

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Base de données**: SQLite (développement) / PostgreSQL (production)
- **ORM**: Sequelize
- **Authentification**: JWT (désactivé en mode test)
- **Port**: 5003

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
- entreprise-service démarré sur le port 5002

### Installation
```bash
# Cloner le repository (si nécessaire)
cd offre-service

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

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5003
- **Health Check**: http://localhost:5003/health

## 📚 Documentation API

### Offres

#### Lister toutes les offres (avec filtres)
```http
GET /api/offers?status=published&location=Paris&skills=JavaScript
```

#### Créer une offre
```http
POST /api/offers
Content-Type: application/json

{
  "enterpriseId": 1,
  "title": "Développeur Web Full Stack",
  "description": "Recherche développeur expérimenté...",
  "requiredSkills": ["JavaScript", "React", "Node.js"],
  "location": "Paris",
  "status": "published"
}
```

#### Récupérer une offre
```http
GET /api/offers/{id}
```

#### Mettre à jour une offre
```http
PUT /api/offers/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "closed"
}
```

#### Supprimer une offre
```http
DELETE /api/offers/{id}
```

#### Filtrer les offres
```http
GET /api/offers?status=published&location=Paris&skills=JavaScript&limit=10&offset=0
```

### Candidatures

#### Postuler à une offre
```http
POST /api/offers/{offerId}/applications
Content-Type: application/json

{
  "studentUserId": "student-123",
  "coverLetter": "Je suis très intéressé..."
}
```

#### Lister les candidatures d'une offre
```http
GET /api/offers/{offerId}/applications
```

#### Mettre à jour le statut d'une candidature
```http
PATCH /api/offers/{offerId}/applications/{applicationId}
Content-Type: application/json

{
  "status": "accepted" // ou "rejected"
}
```

### Communication avec entreprise-service

#### Récupérer une entreprise
```http
GET /api/enterprises/{enterpriseId}
# Proxy vers entreprise-service:5002
```

#### Vérifier si une entreprise existe
```http
GET /api/enterprises/{enterpriseId}/exists
# Proxy vers entreprise-service:5002
```

## 🗄️ Base de données

### Configuration SQLite (développement)
```env
DB_DIALECT=sqlite
SQLITE_STORAGE=./offre_db.sqlite
```

### Configuration PostgreSQL (production)
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=offre_db
```

### Modèles de données

#### Offer
```javascript
{
  id: INTEGER (PK),
  enterpriseId: INTEGER (FK vers entreprise-service),
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
  coverLetter: TEXT,
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
PORT=5003

# Configuration base de données
DB_DIALECT=sqlite
SQLITE_STORAGE=./offre_db.sqlite

# Configuration PostgreSQL (alternative)
# DB_DIALECT=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_NAME=offre_db

# Service entreprise-service
ENTREPRISE_SERVICE_URL=http://localhost:5002

# JWT (non utilisé en mode test)
JWT_SECRET=supersecret

# CORS
CORS_ORIGIN=*
```

## 🚀 Déploiement

### Docker
```bash
# Build
docker build -t offre-service .

# Run
docker run -p 5003:5003 offre-service
```

### Docker Compose
```bash
# Avec PostgreSQL
docker-compose up -d offre-postgres

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
1. **Erreur 404**: Vérifier que le backend tourne sur le port 5003
2. **req.user undefined**: Exécuter `fix-req-user.bat`
3. **Base de données vide**: Exécuter le seed approprié
4. **Communication entreprise-service**: Vérifier que entreprise-service tourne sur port 5002

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

**TalentBridge - Offre Service**  
*Gestion moderne des offres d'emploi et candidatures*
