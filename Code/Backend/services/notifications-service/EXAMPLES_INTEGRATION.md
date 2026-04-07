# 🔌 Service Integration - Detailed Examples

Ce fichier contient des exemples d'intégration complète pour chaque service TalentBridge.

---

## 1️⃣ AUTH-SERVICE Integration

### Scénario: Créer une notification lors de l'inscription

**Fichier**: `auth-service/src/Controllers/authController.js`

```javascript
const authService = require('../services/authService');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * POST /api/auth/register
 * Créer un nouvel utilisateur + notification de bienvenue
 */
exports.register = asyncHandler(async (req, res) => {
  // 1. Créer l'utilisateur
  const user = await authService.createUser(req.body);

  // 2. 🎯 Envoyer notification de bienvenue
  // Important : ne pas bloquer si la notification échoue
  notificationService.createNotification({
    userId: user.id,
    type: 'registration',
    message: `Bienvenue ${user.firstName}! Votre compte TalentBridge a été créé avec succès.`,
    canal: 'email',      // Email principal pour l'inscription
    priority: 'high'
  }).catch(err => {
    console.warn('Notification registration failed:', err.message);
    // Continue malgré l'erreur
  });

  res.status(201).json({
    message: 'Inscription réussie',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }
  });
});

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.authenticateUser(email, password);
  const token = authService.generateToken(user);

  // 🎯 Optional: Notifier en-app de la connexion
  notificationService.createNotification({
    userId: user.id,
    type: 'message',
    message: `Connexion détectée de ${user.email} à ${new Date().toLocaleString()}`,
    canal: 'in-app',
    priority: 'low'
  }).catch(() => {});

  res.json({
    token,
    user
  });
});
```

**Fichier**: `auth-service/src/services/notificationService.js`

```javascript
const axios = require('axios');

const NOTIFICATIONS_API = process.env.NOTIFICATIONS_SERVICE_URL 
  || 'http://notifications-service:5003/api/notifications';

const SERVICE_TOKEN = process.env.SERVICE_JWT_TOKEN 
  || 'dev-token-for-tests';

/**
 * Helper pour appeler notifications-service
 */
async function createNotification(data) {
  try {
    const response = await axios.post(NOTIFICATIONS_API, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_TOKEN}`
      },
      timeout: 5000 // Timeout rapide pour ne pas bloquer
    });

    console.log(`[NOTIFICATIONS] Created: ${data.type} for user ${data.userId}`);
    return response.data;
  } catch (err) {
    console.error(
      `[NOTIFICATIONS] Error creating ${data.type} for user ${data.userId}:`,
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = {
  createNotification
};
```

**Variables d'environnement** (`.env`):

```env
NOTIFICATIONS_SERVICE_URL=http://notifications-service:5003/api/notifications
SERVICE_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2️⃣ OFFRE-SERVICE Integration

### Scénario: Notifier les étudiants d'une nouvelle offre

**Fichier**: `offre-service/src/Controllers/offerController.js`

```javascript
const Offer = require('../Models/Offer');
const matchingService = require('../services/matchingService');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * POST /api/offers
 * Créer une nouvelle offre + notifier les candidats potentiels
 */
exports.createOffer = asyncHandler(async (req, res) => {
  const { title, description, company, skills, salary } = req.body;

  // 1. Créer l'offre
  const offer = await Offer.create({
    title,
    description,
    company,
    skills,
    salary,
    enterpriseId: req.user.id
  });

  // 2. 🎯 Trouver les étudiants correspondant au profil
  const matchingStudents = await matchingService.findMatchingStudents({
    minSkills: skills,
    maxSalaryExpectation: salary
  });

  // 3. 🎯 Envoyer des notifications
  const notificationPromises = matchingStudents.map(student =>
    notificationService.createNotification({
      userId: student.id,
      type: 'new_offer',
      message: `Nouvelle offre: ${title} chez ${company}`,
      canal: 'email', // Email pour les offres importantes
      priority: 'high',
      relatedEntityId: offer.id,
      relatedEntityType: 'offer'
    }).catch(err => {
      console.warn(`Failed to notify student ${student.id}:`, err.message);
    })
  );

  // Ne pas attendre les notifications pour répondre
  await Promise.allSettled(notificationPromises);

  res.status(201).json({
    message: `Offre créée, ${matchingStudents.length} étudiants notifiés`,
    offer
  });
});
```

### Scénario: Statut de candidature

**Fichier**: `offre-service/src/Controllers/applicationController.js`

```javascript
const Application = require('../Models/Application');
const User = require('../Models/User');
const Offer = require('../Models/Offer');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../utils/asyncHandler');

const STATUS_LABELS = {
  submitted: 'Candidature reçue',
  interview: 'Entretien prévu',
  accepted: 'Candidature acceptée',
  rejected: 'Candidature refusée'
};

/**
 * PATCH /api/applications/:id/status
 * Changer le statut d'une candidature
 */
exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  // Valider le statut
  if (!STATUS_LABELS[status]) {
    return res.status(400).json({ message: 'Statut invalide' });
  }

  // 1. Récupérer la candidature
  const application = await Application.findByPk(id);
  if (!application) {
    return res.status(404).json({ message: 'Candidature non trouvée' });
  }

  const oldStatus = application.status;
  application.status = status;
  await application.save();

  // 2. 🎯 Notifier le candidat du changement
  const student = await User.findByPk(application.userId);
  const offer = await Offer.findByPk(application.offerId);

  notificationService.createNotification({
    userId: student.id,
    type: 'application_status',
    message: `${STATUS_LABELS[status]}: ${offer.title}`,
    canal: 'email', // Statut important = email
    priority: status === 'rejected' || status === 'accepted' ? 'critical' : 'high',
    relatedEntityId: application.id,
    relatedEntityType: 'application'
  }).catch(err => {
    console.error('Failed to notify application status:', err.message);
  });

  // 3. 🎯 Notifier l'entreprise si candidature acceptée
  if (status === 'accepted') {
    const enterprise = await User.findByPk(offer.enterpriseId);
    notificationService.createNotification({
      userId: enterprise.id,
      type: 'message',
      message: `${student.firstName} ${student.lastName} a accepté votre offre: ${offer.title}`,
      canal: 'in-app',
      priority: 'high'
    }).catch(err => {
      console.error('Failed to notify enterprise:', err.message);
    });
  }

  res.json({
    application,
    previousStatus: oldStatus,
    newStatus: status
  });
});
```

---

## 3️⃣ USER-SERVICE Integration

### Scénario: Mise à jour du profil

**Fichier**: `user-service/src/Controllers/userController.js`

```javascript
const User = require('../Models/User');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * PUT /api/users/:id/profile
 * Mettre à jour le profil utilisateur
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  const updates = req.body;
  Object.assign(user, updates);
  await user.save();

  // 🎯 Notifier l'utilisateur de la mise à jour
  notificationService.createNotification({
    userId: user.id,
    type: 'profile_update',
    message: 'Votre profil a été mis à jour avec succès',
    canal: 'in-app',
    priority: 'normal'
  }).catch(err => {
    console.warn('Profile update notification failed:', err.message);
  });

  res.json({
    message: 'Profil mis à jour',
    user
  });
});

/**
 * POST /api/users/:id/skills
 * Ajouter une compétence
 */
exports.addSkill = asyncHandler(async (req, res) => {
  const { skill } = req.body;
  const user = await User.findByPk(req.params.id);

  if (!user.skills) user.skills = [];
  user.skills.push(skill);
  await user.save();

  // 🎯 Notifier de la nouvelle compétence
  notificationService.createNotification({
    userId: user.id,
    type: 'profile_update',
    message: `Compétence ajoutée: ${skill}`,
    canal: 'in-app',
    priority: 'low'
  }).catch(() => {});

  res.json({ userSkills: user.skills });
});
```

---

## 4️⃣ IA/DOCUMENTS-SERVICE Integration

### Scénario: Document généré (CV, lettres, etc.)

**Fichier**: `ia-service/src/Controllers/documentController.js`

```javascript
const Document = require('../Models/Document');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * POST /api/documents/generate
 * Générer un document (CV, lettre, etc.)
 */
exports.generateDocument = asyncHandler(async (req, res) => {
  const { userId, type, templateData } = req.body;

  // 1. Générer le document (simulated)
  const document = await Document.create({
    userId,
    type, // 'cv', 'cover_letter', 'resume'
    filePath: `/documents/${userId}/${Date.now()}.pdf`,
    status: 'generated'
  });

  // 2. 🎯 Notifier l'utilisateur que le document est prêt
  notificationService.createNotification({
    userId: document.userId,
    type: 'document_generated',
    message: `Votre ${type === 'cv' ? 'CV' : 'lettre'} a été généré avec succès et est prêt à télécharger`,
    canal: 'email',
    priority: 'high',
    relatedEntityId: document.id,
    relatedEntityType: 'document'
  }).catch(err => {
    console.error('Document generation notification failed:', err.message);
  });

  res.status(201).json({
    message: `Document ${type} généré et notification envoyée`,
    document
  });
});
```

---

## 5️⃣ ADMIN-SERVICE Integration

### Scénario: Alert administratif

**Fichier**: `admin-service/src/Controllers/moderationController.js`

```javascript
const Report = require('../Models/Report');
const User = require('../Models/User');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * POST /api/admin/reports/:id/review
 * Examiner un signalement et prendre action
 */
exports.reviewReport = asyncHandler(async (req, res) => {
  const { action, reason } = req.body; // action: 'approve', 'reject', 'ban'
  const report = await Report.findByPk(req.params.id);

  // 1. Prendre action
  report.status = 'reviewed';
  report.action = action;
  report.reason = reason;
  await report.save();

  const reportedUser = await User.findByPk(report.reportedUserId);

  // 2. 🎯 Notifier l'utilisateur signalé
  if (action === 'ban') {
    notificationService.createNotification({
      userId: reportedUser.id,
      type: 'admin_alert',
      message: `Votre compte a été suspendu pour: ${reason}`,
      canal: 'email',
      priority: 'critical'
    }).catch(() => {});
  } else if (action === 'warn') {
    notificationService.createNotification({
      userId: reportedUser.id,
      type: 'admin_alert',
      message: `Avertissement: ${reason}`,
      canal: 'in-app',
      priority: 'high'
    }).catch(() => {});
  }

  // 3. 🎯 Notifier l'admin
  const admins = await User.findAll({ where: { role: 'admin' } });
  admins.forEach(admin => {
    notificationService.createNotification({
      userId: admin.id,
      type: 'admin_alert',
      message: `Signalement examiné de ${reportedUser.email}: ${action}`,
      canal: 'in-app',
      priority: 'normal'
    }).catch(() => {});
  });

  res.json({ report });
});
```

---

## 📋 Checklist pour intégration

Pour chaque service, suivre cette checklist :

- [ ] Installer `axios` : `npm install axios`
- [ ] Créer `src/services/notificationService.js`
- [ ] Configurer `.env` : `NOTIFICATIONS_SERVICE_URL`, `SERVICE_JWT_TOKEN`
- [ ] Importer et utiliser dans les controllers pertinents
- [ ] Ajouter `.catch()` pour ne pas bloquer le flux
- [ ] Tester avec `npm run test`
- [ ] Documenter les notifications créées dans ce service
- [ ] Vérifier les logs : `docker-compose logs notifications-service`

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2026-04-07
