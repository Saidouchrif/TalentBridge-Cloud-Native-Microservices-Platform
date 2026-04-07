# Notifications Service - TalentBridge Platform

Microservice centralisé pour la gestion complète des notifications (email, in-app, push) dans la plateforme TalentBridge.

## 📋 Table des matières

- [🎯 Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Démarrage rapide](#-démarrage-rapide)
- [📚 API REST](#-api-rest)
- [🔐 Sécurité](#-sécurité)
- [🗄️ Base de données](#️-base-de-données)
- [🐳 Docker & K8s](#-docker--k8s)
- [📧 Configuration Email](#-configuration-email)
- [🧪 Tests](#-tests)
- [🔗 Intégration inter-services](#-intégration-inter-services)

---

## 🎯 Fonctionnalités

### Canaux de notification supportés

- **Email** : Messages structurés via SMTP
- **In-App** : Affichage en temps réel dans l'interface React
- **Push** : Support Firebase Cloud Messaging (optionnel)

### Types de notifications

- ✅ Confirmation d'inscription / connexion
- ✅ Mise à jour du profil (compétences, formations, expériences)
- ✅ Nouvelle offre correspondant au profil étudiant
- ✅ Statut candidature (soumise, acceptée, refusée)
- ✅ Alertes administratives (modération, supervisions)
- ✅ Notifications de documents générés (CV, lettres)
- ✅ Notifications d'événements et messages généraux

### Gestion avancée

- **Préférences utilisateur** : Canal préféré (email/push/in-app)
- **Notification groupées** : Résumés quotidiens/hebdomadaires
- **Priorisation** : Distinction critique vs standard
- **Tracking** : Taux de lecture, horodatage, statuts
- **Multilingue** : Support français/anglais

---

## 🏗️ Architecture

### Stack technologique

- **Backend** : Node.js 20 + Express.js 5
- **Base de données** : PostgreSQL + Sequelize ORM
- **Authentification** : JWT (validation côté API Gateway ou middleware)
- **Email** : Nodemailer (SMTP + Dev mode)
- **Conteneurisation** : Docker + Docker Compose
- **Orchestration** : Kubernetes (Deployment + Service)

### Modèle de données

```
Notification
├─ id (PK)
├─ userId (FK, indexed)
├─ type (enum: registration, profile_update, new_offer, ...)
├─ message (TEXT)
├─ canal (enum: email, in-app, push)
├─ statut (enum: pending, sent, read, deleted)
├─ relatedEntityId (nullable)
├─ relatedEntityType (string)
├─ priority (enum: low, normal, high, critical)
├─ readAt (timestamp)
├─ sentAt (timestamp)
├─ createdAt (indexed)
└─ updatedAt

NotificationPreference
├─ id (PK)
├─ userId (FK, unique)
├─ emailEnabled (boolean)
├─ inAppEnabled (boolean)
├─ pushEnabled (boolean)
├─ preferredLanguage (enum: fr, en)
├─ notificationFrequency (enum: immediate, daily_summary, weekly_summary)
├─ createdAt
└─ updatedAt
```

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- npm ou yarn
- PostgreSQL 12+ (ou Docker)

### Installation locale

```bash
cd services/notifications-service

# Installer les dépendances backend
npm install

# Installer les dépendances frontend
cd frontend && npm install
cd ..

# Créer le fichier .env (voir config)
cp .env.example .env

# Démarrer le backend en développement (hot reload)
npm run dev
```

### Frontend local

Le frontend React se trouve dans `frontend/`.

```bash
cd services/notifications-service/frontend
npm run dev
```

L'interface sera disponible par défaut sur `http://localhost:4173` en mode dev.
En production ou en Docker, le backend sert le build React depuis `public/`.

### Avec Docker Compose

```bash
cd services/notifications-service

# Lancer le service + PostgreSQL
docker-compose up -d

# Logs
docker-compose logs -f notifications-service

# Arrêter
docker-compose down
```

### Accès

- **Service** : http://localhost:5003
- **Health Check** : http://localhost:5003/health
- **API** : http://localhost:5003/api/notifications
- **Frontend intégré** : http://localhost:5003/

---

## 🧪 CI/CD

Ce service dispose d'un workflow GitHub Actions dédié : `.github/workflows/notifications-service-ci.yml`.

Il exécute :
- installation backend
- installation frontend
- tests Jest backend
- build frontend Vite
- build Docker image
- smoke test `http://localhost:5003/health`

---

## 📚 API REST

### Base URL

```
http://localhost:5003/api/notifications
```

### Authentification

Toutes les routes **protégées** nécessitent un token JWT dans l'header :

```
Authorization: Bearer <JWT_TOKEN>
```

Ou en mode test/développement, les headers :

```
X-User-ID: 123
X-User-Role: student|enterprise|admin
X-User-Email: user@example.com
```

### Endpoints

#### 1. Créer une notification
**POST /api/notifications**

```bash
curl -X POST http://localhost:5003/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "userId": 1,
    "type": "new_offer",
    "message": "Nouvelle offre: Développeur Full-Stack",
    "canal": "email",
    "priority": "high",
    "relatedEntityId": 42,
    "relatedEntityType": "offer"
  }'
```

**Response (201 Created):**
```json
{
  "notification": {
    "id": 1,
    "userId": 1,
    "type": "new_offer",
    "message": "Nouvelle offre: Développeur Full-Stack",
    "canal": "email",
    "statut": "pending",
    "priority": "high",
    "createdAt": "2026-04-07T10:30:00Z",
    "updatedAt": "2026-04-07T10:30:00Z"
  }
}
```

#### 2. Récupérer les notifications d'un utilisateur
**GET /api/notifications?limit=50&offset=0&statut=pending**

```bash
curl http://localhost:5003/api/notifications \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "id": 1,
      "userId": 1,
      "type": "new_offer",
      "message": "Nouvelle offre: Développeur Full-Stack",
      "canal": "email",
      "statut": "sent",
      "priority": "high",
      "createdAt": "2026-04-07T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

#### 3. Récupérer une notification spécifique
**GET /api/notifications/:id**

```bash
curl http://localhost:5003/api/notifications/1 \
  -H "Authorization: Bearer <TOKEN>"
```

#### 4. Marquer comme lue
**PATCH /api/notifications/:id/read**

```bash
curl -X PATCH http://localhost:5003/api/notifications/1/read \
  -H "Authorization: Bearer <TOKEN>"
```

#### 5. Marquer comme non lue
**PATCH /api/notifications/:id/unread**

```bash
curl -X PATCH http://localhost:5003/api/notifications/1/unread \
  -H "Authorization: Bearer <TOKEN>"
```

#### 6. Supprimer une notification (soft delete)
**DELETE /api/notifications/:id**

```bash
curl -X DELETE http://localhost:5003/api/notifications/1 \
  -H "Authorization: Bearer <TOKEN>"
```

#### 7. Compter notifications non lues
**GET /api/notifications/unread/count**

```bash
curl http://localhost:5003/api/notifications/unread/count \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200 OK):**
```json
{
  "unreadCount": 5
}
```

#### 8. Récupérer préférences de notification
**GET /api/notifications/preferences**

```bash
curl http://localhost:5003/api/notifications/preferences \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200 OK):**
```json
{
  "preferences": {
    "id": 1,
    "userId": 1,
    "emailEnabled": true,
    "inAppEnabled": true,
    "pushEnabled": false,
    "preferredLanguage": "fr",
    "notificationFrequency": "immediate"
  }
}
```

#### 9. Mettre à jour préférences
**PUT /api/notifications/preferences**

```bash
curl -X PUT http://localhost:5003/api/notifications/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "emailEnabled": true,
    "inAppEnabled": false,
    "pushEnabled": true,
    "preferredLanguage": "en",
    "notificationFrequency": "daily_summary"
  }'
```

---

## 🔐 Sécurité

### Authentification

- **JWT obligatoire** sur toutes les routes (`/api` inclus)
- Validation du token via middleware `requireAuth`
- Extraction de `userId`, `role`, `email` depuis le JWT

### Autorisation (RBAC)

- **Création de notifications** : Réservée aux rôles `admin` et `system`
- **Lecture de ses notifications** : N'importe quel utilisateur authentifié
- **Suppression de ses notifications** : L'utilisateur propriétaire uniquement

### Validation des données

- Utilisation de **Zod** ou validation Express native
- Whitelist sur les champs acceptés
- Sanitization des messages (prévention XSS)

### Prévention d'abus

- **Rate limiting** recommandé à l'API Gateway
- Logs d'audit pour les actions sensibles
- Soft delete pour la traçabilité (GDPR-friendly)

---

## 🗄️ Base de données

### Configuration PostgreSQL

**Variables d'environnement :**

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=notifications_db
```

### Migrations (optionnel)

Pour un projet productif, utiliser **Sequelize CLI** :

```bash
# Générer une migration
npx sequelize-cli migration:generate --name add-notification-table

# Exécuter
npx sequelize-cli db:migrate
```

### Performance

- **Index sur `userId`** : Requêtes rapides par utilisateur
- **Index composite sur `(userId, createdAt)`** : Tri chronologique
- **Index sur `statut`** : Filtrage par statut
- **Évalué pour > 100k notifications/jour**

---

## 🐳 Docker & K8s

### Docker Compose (dev/test)

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

**Services inclus :**
- `notifications-service` (Node.js) → port 5003
- `postgres` (DB) → port 5433

### Kubernetes (production)

**Déployer :**

```bash
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/deployment.yaml
```

**Vérifier :**

```bash
kubectl get svc notifications-service
kubectl get deployment notifications-service
kubectl logs -f deployment/notifications-service
```

**Replicas et scaling :**

```bash
kubectl scale deployment notifications-service --replicas=3
```

---

## 📧 Configuration Email

### Mode développement (défaut)

```env
EMAIL_PROVIDER=test
```

Utilise **Ethereal Email** (capturer les emails en dev, pas réels envois).

### Mode production (SMTP)

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
EMAIL_FROM=no-reply@talentbridge.com
```

**Gmail App Passwords :**

1. Activer 2FA sur Google Account
2. Générer une "App Password"
3. Utiliser dans `SMTP_PASSWORD`

### Templates d'email

Prédéfinis dans `src/services/emailService.js` :

- `sendRegistrationEmail()`
- `sendApplicationStatusEmail()`
- `sendNewOfferEmail()`

Extensible pour nouveaux types.

---

## 🧪 Tests

### Lancer les tests

```bash
npm test
```

### Tests unitaires (Jest)

Fichiers : `src/**/*.test.js`

```bash
npm test -- --coverage
```

### Tests d'intégration (Supertest)

```javascript
// Exemple test route
test('POST /api/notifications crée une notification', async () => {
  const res = await request(app)
    .post('/api/notifications')
    .set('Authorization', 'Bearer token')
    .send({ userId: 1, type: 'new_offer', message: 'Test' });

  expect(res.statusCode).toBe(201);
  expect(res.body.notification).toBeDefined();
});
```

---

## 🔗 Intégration inter-services

### Communication service-to-service

Les notifications sont **créées via API REST** appels depuis les autres services :

```javascript
// Exemple: auth-service appelle notifications-service
const notificationData = {
  userId: newUser.id,
  type: 'registration',
  message: `Bienvenue ${newUser.name}!`,
  canal: 'email',
  priority: 'high'
};

await fetch('http://notifications-service:5003/api/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_TOKEN}`
  },
  body: JSON.stringify(notificationData)
});
```

### Événements déclenchant une notification

| Service | Événement | Type Notification |
|---------|-----------|-------------------|
| auth-service | Nouv. utilisateur | registration |
| user-service | Profil modifié | profile_update |
| offre-service | Offre publiée | new_offer |
| offre-service | Candidature soumise | application_status |
| admin-service | Signalement | admin_alert |
| ia-service | Document généré | document_generated |

### Service Gateway (optionnel)

Intégrer dans le frontend pour affichage temps réel :

```javascript
// React Hook pour WebSocket
useEffect(() => {
  const socket = io('http://notifications-service:5003', {
    auth: { token: jwt }
  });

  socket.on('notification', (data) => {
    // Afficher notification in-app
    showNotification(data);
  });

  return () => socket.disconnect();
}, []);
```

---

## 📝 Roadmap future

- [ ] WebSocket pour notifications en temps réel (in-app)
- [ ] Firebase Cloud Messaging (FCM) pour push
- [ ] Queue async (RabbitMQ / Kafka) pour scalabilité
- [ ] Analytics dashboard (taux de lecture, perf)
- [ ] Batch emails (digest quotidiens)
- [ ] Support SMS via Twilio
- [ ] Notification multilingue dynamique

---

## 🤝 Contribution

1. Fork du repo
2. Feature branch : `git checkout -b feature/amazing`
3. Commit : `git commit -m 'Add amazing feature'`
4. Push : `git push origin feature/amazing`
5. Pull Request

---

## 📄 Licence

ISC

---

**Auteur(s)** : TalentBridge Team  
**Version** : 1.0.0  
**Dernière mise à jour** : 2026-04-07
