# 📩 NOTIFICATIONS SERVICE - Integration Guide

Ce document explique comment intégrer le **notifications-service** aux autres microservices.

## 🔌 Communication via API REST

Le notifications-service expose une API REST sécurisée pour la création et gestion des notifications.

### URL de base

```
http://notifications-service:5003/api/notifications  (intra-réseau Docker)
http://localhost:5003/api/notifications              (développement local)
```

### Headers requis

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

En **mode test/développement**, utiliser les headers :

```
X-User-ID: <userid>
X-User-Role: admin|system|student|enterprise
X-User-Email: <email>
```

---

## 📤 Exemples d'intégration par service

### 1️⃣ **Auth Service** - Notification d'inscription

**Endpoint** : POST `/api/auth/register`

```javascript
// auth-service/src/Controllers/authController.js

const notificationService = require('../services/notificationService');

exports.register = async (req, res) => {
  const user = await User.create(req.body);

  // 🎯 Créer une notification d'inscription
  try {
    await notificationService.createNotification({
      userId: user.id,
      type: 'registration',
      message: `Bienvenue ${user.name} sur TalentBridge!`,
      canal: 'email',
      priority: 'high'
    });
  } catch (err) {
    console.error('Erreur notification:', err);
    // Ne pas bloquer l'inscription si la notification échoue
  }

  res.status(201).json({ user });
};
```

**Créer un service helper** :

```javascript
// auth-service/src/services/notificationService.js

const axios = require('axios');

const NOTIFICATIONS_SERVICE_URL = process.env.NOTIFICATIONS_SERVICE_URL 
  || 'http://notifications-service:5003/api/notifications';

const SERVICE_TOKEN = process.env.SERVICE_JWT_TOKEN;

async function createNotification(data) {
  try {
    const response = await axios.post(NOTIFICATIONS_SERVICE_URL, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_TOKEN}`
      }
    });
    return response.data;
  } catch (err) {
    console.error('Notifications API error:', err.message);
    throw err;
  }
}

module.exports = { createNotification };
```

---

### 2️⃣ **Offre Service** - Notification de nouvelle offre

**Endpoint** : POST `/api/offers`

```javascript
// offre-service/src/Controllers/offerController.js

const notificationService = require('../services/notificationService');

exports.createOffer = async (req, res) => {
  const offer = await Offer.create(req.body);

  // 🎯 Notifier les étudiants avec profil correspondant
  // (optionnel : via un matching service)
  try {
    const matchingStudents = await getMatchingStudents(offer);
    
    await Promise.all(
      matchingStudents.map(student =>
        notificationService.createNotification({
          userId: student.id,
          type: 'new_offer',
          message: `Nouvelle offre: ${offer.title} chez ${offer.company}`,
          canal: 'email',
          priority: 'normal',
          relatedEntityId: offer.id,
          relatedEntityType: 'offer'
        })
      )
    );
  } catch (err) {
    console.error('Erreur notification offre:', err);
  }

  res.status(201).json({ offer });
};
```

---

### 3️⃣ **Offre Service** - Statut de candidature

**Endpoint** : PATCH `/api/applications/:id/status`

```javascript
// offre-service/src/Controllers/applicationController.js

const notificationService = require('../services/notificationService');

const statusLabels = {
  submitted: 'Candidature reçue',
  accepted: 'Candidature acceptée',
  rejected: 'Candidature refusée',
  interview: 'Entretien prévu'
};

exports.updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const application = await Application.findByPk(req.params.id);

  application.status = status;
  await application.save();

  // 🎯 Notifier le candidat du changement de statut
  try {
    const applicant = await User.findByPk(application.userId);
    const offer = await Offer.findByPk(application.offerId);

    await notificationService.createNotification({
      userId: applicant.id,
      type: 'application_status',
      message: `${statusLabels[status]}: ${offer.title}`,
      canal: 'email',
      priority: 'high',
      relatedEntityId: application.id,
      relatedEntityType: 'application'
    });
  } catch (err) {
    console.error('Erreur notification statut:', err);
  }

  res.json({ application });
};
```

---

### 4️⃣ **User Service** - Mise à jour de profil

**Endpoint** : PUT `/api/users/:id/profile`

```javascript
// user-service/src/Controllers/userController.js

const notificationService = require('../services/notificationService');

exports.updateProfile = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  Object.assign(user, req.body);
  await user.save();

  // 🎯 Notifier l'utilisateur de la mise à jour
  try {
    await notificationService.createNotification({
      userId: user.id,
      type: 'profile_update',
      message: 'Votre profil a été mis à jour avec succès',
      canal: 'in-app',
      priority: 'normal'
    });
  } catch (err) {
    console.error('Erreur notification profil:', err);
  }

  res.json({ user });
};
```

---

### 5️⃣ **IA/Documents Service** - Document généré

**Endpoint** : POST `/api/documents/generate`

```javascript
// ia-service/src/Controllers/documentController.js

const notificationService = require('../services/notificationService');

exports.generateDocument = async (req, res) => {
  const document = await Document.create(req.body);

  // 🎯 Notifier que le document est prêt
  try {
    await notificationService.createNotification({
      userId: document.userId,
      type: 'document_generated',
      message: `Votre ${document.type} (${document.name}) est prêt à télécharger`,
      canal: 'email',
      priority: 'high',
      relatedEntityId: document.id,
      relatedEntityType: 'document'
    });
  } catch (err) {
    console.error('Erreur notification document:', err);
  }

  res.status(201).json({ document });
};
```

---

## 🛡️ JWT & Authentification Service-to-Service

Pour une sécurité renforcée, les services doivent utiliser un JWT dédié (service-to-service token).

### Configuration

**.env de chaque service :**

```env
# Token JWT pour appels service-to-service
SERVICE_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL du notifications-service
NOTIFICATIONS_SERVICE_URL=http://notifications-service:5003/api/notifications
```

### Créer un token service-to-service

```javascript
// Généré une fois au démarrage ou dans les secrets K8s

const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    id: 'system-service',
    role: 'system',
    email: 'system@talentbridge.com'
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('SERVICE_JWT_TOKEN=', token);
```

---

## 📊 Priorisation & Canaux

### Tableau de recommandations

| Type Événement | Priority | Canal par défaut | Fallback |
|---|---|---|---|
| registration | high | email | in-app |
| profile_update | normal | in-app | - |
| new_offer | normal | email | in-app |
| application_status | **critical** | **email** | push, in-app |
| admin_alert | high | in-app | email |
| document_generated | high | email | in-app |

### Logique de sélection du canal

```javascript
// Helper pour choisir le bon canal selon préférences
async function selectNotificationChannel(userId, defaultCanal) {
  const prefs = await NotificationPreference.findOne({ where: { userId } });

  if (!prefs) return defaultCanal;

  // Respecter les préférences utilisateur
  const canals = ['email', 'in-app', 'push'];
  const preferred = canals.filter(c => {
    if (c === 'email') return prefs.emailEnabled;
    if (c === 'in-app') return prefs.inAppEnabled;
    if (c === 'push') return prefs.pushEnabled;
  });

  return preferred.length > 0 ? preferred[0] : defaultCanal;
}
```

---

## 🔄 Gestion des erreurs

Les appels au notifications-service ne doivent **jamais bloquer** les opérations principales :

```javascript
// ❌ MAUVAIS - Bloque la création de l'user
const user = await User.create(data);
await notificationService.createNotification(...); // Si ça échoue → user pas créé
res.json({ user });

// ✅ BON - Asynchrone, ne bloque pas
const user = await User.create(data);
notificationService.createNotification(...)
  .catch(err => console.error('Notification failed:', err)); // Log seulement
res.json({ user });
```

---

## 🧪 Tests d'intégration

```javascript
// Example: offre-service test

const request = require('supertest');
const app = require('../app');
const nock = require('nock'); // Mock HTTP calls

describe('Offer creation with notifications', () => {
  test('should send notification when creating offer', async () => {
    // Mock notifications-service
    nock('http://notifications-service:5003')
      .post('/api/notifications')
      .reply(201, { notification: { id: 1 } });

    const res = await request(app)
      .post('/api/offers')
      .send({
        title: 'Dev Job',
        company: 'TalentBridge',
        description: '...'
      });

    expect(res.statusCode).toBe(201);
    expect(nock.isDone()).toBe(true); // Notif bien envoyée
  });
});
```

---

## 📝 Checklist d'intégration

- [ ] Ajouter `notificationService` au service
- [ ] Configurer `NOTIFICATIONS_SERVICE_URL` et `SERVICE_JWT_TOKEN` en `.env`
- [ ] Ajouter `axios` aux dépendances (`npm install axios`)
- [ ] Implémenter appels `createNotification()` aux bons endroits
- [ ] Ajouter `.catch()` pour pas bloquer le flux
- [ ] Tester avec `docker-compose` local
- [ ] Configurer logs pour déboguer les erreurs notifs
- [ ] Déployer & monitorer en production

---

## 🚀 Déploiement

### Docker Compose (all services)

```yaml
# docker-compose.yml principal

services:
  notifications-service:
    build: ./Code/Backend/services/notifications-service
    ports:
      - "5003:5003"
    environment:
      DB_HOST: postgres
      # ... autres vars
    depends_on:
      - postgres
    networks:
      - talentbridge-network

  # ... autres services
  
  networks:
    talentbridge-network:
```

### Kubernetes

```yaml
# ConfigMap pour variables communes
apiVersion: v1
kind: ConfigMap
metadata:
  name: services-config
data:
  NOTIFICATIONS_SERVICE_URL: "http://notifications-service:5003/api/notifications"
```

Puis chaque service référence :

```yaml
env:
  - name: NOTIFICATIONS_SERVICE_URL
    valueFrom:
      configMapKeyRef:
        name: services-config
        key: NOTIFICATIONS_SERVICE_URL
```

---

## 📚 Ressources

- [API Notifications Service](./README.md)
- [Architecture TalentBridge](../../../Conception/TalentBridge_Architecture/)

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2026-04-07
