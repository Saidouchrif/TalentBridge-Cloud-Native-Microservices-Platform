# TalentBridge Entreprise Service - Tests et CI/CD

Ce document décrit la stratégie de tests et le pipeline CI/CD pour le microservice entreprise-service.

## 🧪 Stratégie de Tests

### Tests Backend

#### Tests Unitaires et d'Intégration
- **Fichier**: `tests/api.test.js`
- **Framework**: Jest + Supertest
- **Couverture**: API endpoints, logique métier, validation

#### Tests d'Endpoints
- **Fichier**: `test-endpoints.js`
- **Type**: Tests end-to-end des API
- **Validation**: Réponses HTTP, codes de statut, données

### Tests Frontend

#### Tests Composants React
- **Fichier**: `frontend/src/tests/frontend.test.js`
- **Framework**: Jest + React Testing Library
- **Couverture**: Composants, hooks, interactions utilisateur

#### Tests d'Intégration Frontend
- Validation des flux utilisateur complets
- Tests de navigation et formulaires
- Mock des appels API

## 🚀 Pipeline CI/CD

### Fichier: `.github/workflows/ci-cd.yml`

#### Triggers
- Push sur branches `main` et `develop`
- Pull Requests vers `main`

#### Jobs

##### 1. Test Job
- **OS**: Ubuntu Latest
- **Services**: PostgreSQL (base de données de test)
- **Étapes**:
  1. Checkout code
  2. Setup Node.js 18
  3. Install dependencies (backend + frontend)
  4. Linting (code quality)
  5. Tests backend
  6. Tests frontend
  7. Build frontend
  8. Test API endpoints

##### 2. Security Job
- Audit des dépendances (npm audit)
- Vérification des vulnérabilités
- Analyse des dépendances obsolètes

##### 3. Deploy Job
- Déclenchement: uniquement sur `main`
- Condition: succès des jobs test et security
- Déploiement vers environnement de staging/production

## 📊 Rapports de Tests

### Couverture de Code
- **Backend**: Cible > 80%
- **Frontend**: Cible > 85%
- **Génération**: `npm run test:coverage`

### Rapports Disponibles
- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`
- **JSON**: `coverage/coverage-final.json`

## 🔧 Configuration des Tests

### Variables d'Environnement de Test
```env
NODE_ENV=test
DB_DIALECT=sqlite
SQLITE_STORAGE=:memory:
JWT_SECRET=test_secret
CORS_ORIGIN=*
```

### Scripts de Test
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:api": "node test-endpoints.js"
}
```

## 📋 Checklist de Tests

### Backend Tests ✅
- [ ] CRUD Entreprises
- [ ] CRUD Offres  
- [ ] CRUD Candidatures
- [ ] Validation des données
- [ ] Gestion des erreurs
- [ ] Middleware d'authentification
- [ ] Routes protégées/publiques

### Frontend Tests ✅
- [ ] Rendu des composants
- [ ] Interactions utilisateur
- [ ] Soumission de formulaires
- [ ] Navigation
- [ ] Gestion des états (loading, error, success)
- [ ] Appels API (mockés)

### Integration Tests ✅
- [ ] Flux création entreprise
- [ ] Flux création offre
- [ ] Flux candidature
- [ ] Mise à jour statut candidature
- [ ] Suppression entités

## 🚨 Tests de Sécurité

### Vulnérabilités Connues
- Injection SQL (via Sequelize)
- XSS (via React)
- CSRF (via CORS)
- Authentification JWT

### Outils Utilisés
- **npm audit**: Scan des dépendances
- **eslint**: Analyse statique du code
- **Jest**: Tests de sécurité

## 📈 Métriques Qualité

### Code Quality
- **ESLint**: Respect des standards de code
- **Prettier**: Formatage automatique (recommandé)
- **Complexité**: Maintien d'une faible complexité

### Performance
- **Temps de réponse**: < 200ms pour les endpoints
- **Build frontend**: < 30s
- **Tests execution**: < 60s

## 🔄 Workflow de Développement

### 1. Feature Branch
```bash
git checkout -b feature/nouvelle-fonctionnalite
# Développement + tests
npm run test:watch
```

### 2. Tests Locaux
```bash
# Tests complets
run-tests.bat

# Vérification couverture
npm run test:coverage
```

### 3. Pull Request
- Tests CI/CD automatiques
- Review du code
- Validation des fonctionnalités

### 4. Merge et Déploiement
- Merge vers `develop` → Tests CI/CD
- Merge vers `main` → Déploiement automatique

## 🐛 Débogage des Tests

### Problèmes Courants
1. **Tests timeout**: Augmenter `jest.setTimeout()`
2. **Base de données**: Nettoyage entre tests
3. **Async/await**: Vérifier les promesses
4. **Mocks**: Configuration correcte des mocks

### Commandes Utiles
```bash
# Debug tests
npm test -- --verbose

# Tests spécifiques
npm test -- --testNamePattern="Enterprise"

# Watch mode
npm run test:watch

# Coverage détaillé
npm run test:coverage -- --verbose
```

## 📚 Ressources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Supertest](https://github.com/visionmedia/supertest)

### Bonnes Pratiques
- Tests isolés et indépendants
- Noms de tests descriptifs
- Mock des dépendances externes
- Tests des cas limites et erreurs

---

**TalentBridge Entreprise Service**  
*Tests et CI/CD pour un développement fiable*
