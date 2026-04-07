# ARCHITECTURE OVERVIEW - Notifications Service

Diagramme de l'architecture globale et de l'intégration du notifications-service.

---

## 🏗️ Architecture Globale de la Plateforme

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Dashboard│  │ Profile  │  │  Offers  │  │Notif UI  │            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
└───────┼─────────────┼─────────────┼─────────────┼──────────────────┘
        │             │             │             │
        └─────────────┼─────────────┼─────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│              API GATEWAY (Port 3000)                                 │
│  - Routing                                                           │
│  - JWT Validation                                                    │
│  - Rate Limiting                                                     │
│  - Load Balancing                                                    │
└────────────┬──────────────┬──────────────┬────────────┬──────────────┘
             │              │              │            │
     ┌───────▼───┐  ┌───────▼───┐  ┌──────▼────┐  ┌───▼────────────┐
     │ :5000     │  │ :5001     │  │ :5002    │  │ :5003          │
     │auth-svc   │  │user-svc   │  │offre-svc │  │notifications-s│
     │           │  │           │  │          │  │                │
     └───────────┘  └───────────┘  └──────────┘  └────────────────┘
```

---

## 🔌 Notifications Service - Communications

```
┌────────────────────────────────────────────────────────────────┐
│                   NOTIFICATIONS SERVICE                        │
│                      (Port 5003)                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  API REST Endpoints                                    │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  POST   /api/notifications              [Create]       │  │
│  │  GET    /api/notifications              [List user's]  │  │
│  │  GET    /api/notifications/:id          [Get one]      │  │
│  │  PATCH  /api/notifications/:id/read     [Mark read]    │  │
│  │  PATCH  /api/notifications/:id/unread   [Mark unread]  │  │
│  │  DELETE /api/notifications/:id          [Soft delete]  │  │
│  │  GET    /api/notifications/unread/count [Count]        │  │
│  │  GET    /api/notifications/preferences  [Get prefs]    │  │
│  │  PUT    /api/notifications/preferences  [Update prefs] │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │  Controllers         │  │  Services                    │  │
│  ├──────────────────────┤  ├──────────────────────────────┤  │
│  │- notificationCtrl    │  │- notificationService         │  │
│  │  • getNotifications  │  │  • createNotification        │  │
│  │  • markAsRead        │  │  • getByUserId               │  │
│  │  • delete            │  │  • markAsRead/Unread         │  │
│  │  • getPreferences    │  │                              │  │
│  │  • updatePreferences │  │- emailService                │  │
│  │                      │  │  • sendEmail()               │  │
│  │                      │  │  • sendRegistration()        │  │
│  │                      │  │  • sendApplicationStatus()   │  │
│  │                      │  │  • sendNewOffer()            │  │
│  └──────────────────────┘  └──────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Data Models (Sequelize)                               │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  Notification                                           │ │
│  │  ├─ id, userId, type, message, canal, statut           │ │
│  │  ├─ priority, readAt, sentAt, createdAt                │ │
│  │  └─ relatedEntityId, relatedEntityType                 │ │
│  │                                                          │ │
│  │  NotificationPreference                                │ │
│  │  ├─ userId, emailEnabled, inAppEnabled                │ │
│  │  ├─ pushEnabled, preferredLanguage                    │ │
│  │  └─ notificationFrequency                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
        ▲                               ▲
        │                               │
        │                               │
    REST API Calls            PostgreSQL Connection
    (Service-to-Service)       (Notifications DB)
```

---

## 📡 Communication Service-to-Service

```
┌──────────────────────────────────────────────────────────────────┐
│                    AUTH-SERVICE (5000)                           │
│                                                                  │
│  ✅ POST /register                                               │
│     └─ Crée une notification "registration"                     │
│        └─ Appel: POST notifications-service/api/notifications   │
│           {userId, type: 'registration', canal: 'email'}        │
└──────────────────────────────────────────────────────────────────┘
                               ▲
                               │HTTP REST Call
                               │+ JWT Token
                               │
┌──────────────────────────────────────────────────────────────────┐
│              USER-SERVICE (5001)                                 │
│                                                                  │
│  ✅ PUT /users/:id/profile                                      │
│     └─ Crée une notification "profile_update"                   │
│        └─ Appel: POST notifications-service/api/notifications   │
│           {userId, type: 'profile_update', canal: 'in-app'}     │
└──────────────────────────────────────────────────────────────────┘
                               ▲
                               │HTTP REST Call
                               │+ JWT Token
                               │
┌──────────────────────────────────────────────────────────────────┐
│               OFFRE-SERVICE (5002)                               │
│                                                                  │
│  ✅ POST /offers                                                 │
│     └─ Crée notifications "new_offer" pour students matching    │
│        └─ Appel: POST notifications-service/api/notifications   │
│           {userId, type: 'new_offer', canal: 'email'}           │
│                                                                  │
│  ✅ PATCH /applications/:id/status                              │
│     └─ Crée notification "application_status"                   │
│        └─ Appel: POST notifications-service/api/notifications   │
│           {userId, type: 'application_status', canal: 'email'}  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flow Exemple: Nouvelle Offre

```
┌──────────────────────┐
│ Entreprise crée une  │
│ offre via Frontend   │
└──────────┬───────────┘
           │
           │ Frontend -> API Gateway
           ▼
┌──────────────────────────────────────┐
│ POST /api/offers                     │
│ Body: {title, company, skills, ...}  │
└──────────┬───────────────────────────┘
           │
           │ API Gateway routes to offre-service:5002
           ▼
┌──────────────────────────────────────────┐
│ OFFRE-SERVICE                            │
│ offerController.createOffer()            │
│                                          │
│ 1. Créer l'offre en DB                   │
│ 2. Trouver students matching             │
│ 3. 🎯 Pour chaque student:               │
│    notificationService.createNotification │
│    └─ Type: 'new_offer'                  │
│    └─ Canal: 'email'                     │
│    └─ Priority: 'high'                   │
└──────────┬───────────────────────────────┘
           │
           │ HTTP POST (avec JWT)
           │ + timeout 5s
           │ + async (ne bloque pas)
           ▼
┌───────────────────────────────────────┐
│ NOTIFICATIONS-SERVICE:5003            │
│ POST /api/notifications               │
│                                       │
│ 1. Valider JWT                        │
│ 2. Insérer en DB                      │
│ 3. Récupérer prefs utilisateur        │
│ 4. Sélectionner canal                 │
│    (accord prefs user)                │
│ 5. Si canal=email:                    │
│    emailService.sendNewOfferEmail()   │
│    └─ Nodemailer -> SMTP              │
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ Utilisateur reçoit:                 │
│                                     │
│ 📧 Email (immediate)                │
│    "Nouvelle offre: Dev Job"        │
│                                     │
│ 📱 Notification in-app (si activée) │
│    "Nouvelle offre correspondant"   │
│    (chargée au refresh du dashboard)│
│                                     │
│ 📊 DB logs                          │
│    Notification enregistrée         │
│    Stats pour analytics             │
└─────────────────────────────────────┘
```

---

## 🗄️ Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL (notifications_db)                  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Table: notifications                                  ││
│  ├────────────────────────────────────────────────────────┤│
│  │ id (PK)              | INT SERIAL                      ││
│  │ userId               | INT (indexed)                   ││
│  │ type                 | ENUM (registration, new_of...) ││
│  │ message              | TEXT                            ││
│  │ canal                | ENUM (email, in-app, push)      ││
│  │ statut               | ENUM (pending, sent, read, del) ││
│  │ priority             | ENUM (low, normal, high, crit)  ││
│  │ relatedEntityId      | INT (nullable)                  ││
│  │ relatedEntityType    | VARCHAR(50) (nullable)          ││
│  │ readAt               | DATETIME (nullable)             ││
│  │ sentAt               | DATETIME (nullable)             ││
│  │ createdAt            | DATETIME (indexed)              ││
│  │ updatedAt            | DATETIME                        ││
│  ├────────────────────────────────────────────────────────┤│
│  │ Indexes:                                              ││
│  │ - (userId)                                            ││
│  │ - (userId, createdAt)                                 ││
│  │ - (statut)                                            ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Table: notification_preferences                       ││
│  ├────────────────────────────────────────────────────────┤│
│  │ id (PK)              | INT SERIAL                      ││
│  │ userId (FK, unique)  | INT                             ││
│  │ emailEnabled         | BOOLEAN (default: true)         ││
│  │ inAppEnabled         | BOOLEAN (default: true)         ││
│  │ pushEnabled          | BOOLEAN (default: false)        ││
│  │ preferredLanguage    | ENUM (fr, en)                   ││
│  │ notificationFrequency| ENUM (immediate, daily, weekly) ││
│  │ createdAt            | DATETIME                        ││
│  │ updatedAt            | DATETIME                        ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentification & Autorisation

```
┌─────────────────────────────────────────────────────┐
│  Client Frontend / External Service                 │
├─────────────────────────────────────────────────────┤
│  1. Acquiert un JWT via auth-service               │
│  2. Inclut dans le header Authorization            │
│     Authorization: Bearer <JWT>                    │
└──────────────┬──────────────────────────────────────┘
               │
               │ HTTP Request
               ▼
┌──────────────────────────────────────────────────────┐
│  NOTIFICATIONS-SERVICE                              │
├──────────────────────────────────────────────────────┤
│  Middleware: requireAuth                            │
│  ✓ Valide le JWT avec JWT_SECRET                    │
│  ✓ Extrait: id, role, email                         │
│  ✓ Ajoute req.user                                  │
│  ✓ Si invalid/expired → 401 Unauthorized            │
└──────────────┬───────────────────────────────────────┘
               │
               │ JWT Valid?
               ▼
┌──────────────────────────────────────────────────────┐
│  Middleware: requireRole (optionnel)                │
├──────────────────────────────────────────────────────┤
│  ✓ Vérifie req.user.role dans [admin, system]       │
│  ✓ Met à jour notifications                         │
│  ✓ Si non-autorisé → 403 Forbidden                  │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│  ✅ Controller exécute la logique                    │
│     Accès aux données de req.user                   │
└──────────────────────────────────────────────────────┘
```

---

## 📊 Flux de Données Complet

```
REQUEST LIFECYCLE:
==================

1. CLIENT
   ↓ HTTP Request + JWT
   
2. API GATEWAY (Port 3000)
   ├─ JWT Validation
   ├─ Rate Limiting
   ├─ Cookie JWT → Authorization Header
   ├─ Route based on URL path
   └─ Forward to notifications-service:5003
     ↓
     
3. NOTIFICATIONS-SERVICE
   ├─ requireAuth Middleware
   │  └─ Validate JWT
   │     ├─ Extract userId, role, email
   │     └─ Add to req.user
   │     
   ├─ requireRole Middleware (optionnel)
   │  └─ Check role/permissions
   │  
   ├─ Controller (e.g., getNotifications)
   │  ├─ Input validation
   │  ├─ Call Service layer
   │  └─ Format response
   │
   ├─ Service (notificationService)
   │  ├─ Database query (Sequelize)
   │  ├─ Business logic
   │  └─ Return data
   │
   └─ Database (PostgreSQL)
      └─ Execute query
      
4. RESPONSE
   ├─ JSON formatted
   ├─ Status code (200, 201, 400, etc.)
   └─ Back to API Gateway
   
5. API GATEWAY
   └─ Forward to Client
   
6. CLIENT
   └─ React component updates UI
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│              LOCAL DEVELOPMENT                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  npm run dev  (nodemon hot-reload)                     │
│       ↓                                                 │
│  localhost:5003                                         │
│       │                                                 │
│       └─ SQLite en-memory (tests)  OU                  │
│       └─ PostgreSQL localhost:5432 (dev)               │
│                                                         │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│          DOCKER COMPOSE (Dev/Staging)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  docker-compose up -d                                  │
│       ↓                                                 │
│  ┌─────────────────────────────────────────────────┐  │
│  │ notifications-service:5003                       │  │
│  │ ├─ Node.js 20                                   │  │
│  │ ├─ src/ (hot mounted)                           │  │
│  │ └─ Port 5003                                    │  │
│  └─────────────────────────────────────────────────┘  │
│               │                                        │
│               └─ Depends on: PostgreSQL               │
│                              ↓                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ postgres:15 (Container)                         │  │
│  │ ├─ Port 5433 (mapped)                           │  │
│  │ ├─ Volume: notifications_db_data                │  │
│  │ └─ Database: notifications_db                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│         KUBERNETES (Production)                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  kubectl apply -f k8s/                                 │
│       ↓                                                 │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Deployment: notifications-service               │  │
│  │ ├─ Replicas: 2 (default, scalable)              │  │
│  │ ├─ Image: notifications-service:latest          │  │
│  │ ├─ Container Port: 5003                         │  │
│  │ ├─ Health Checks:                               │  │
│  │ │  ├─ Liveness: /health (30s)                   │  │
│  │ │  └─ Readiness: /health (10s)                  │  │
│  │ ├─ Resources:                                   │  │
│  │ │  ├─ Requests: 100m CPU, 256Mi RAM             │  │
│  │ │  └─ Limits: 500m CPU, 512Mi RAM               │  │
│  │ └─ Env vars from Secrets/ConfigMap              │  │
│  └─────────────────────────────────────────────────┘  │
│               │                                        │
│               └─ Service: notifications-service       │
│                  ├─ Type: ClusterIP                    │
│                  └─ Port: 5003                         │
│                                                         │
│  Database: Managed PostgreSQL                         │
│  (AWS RDS / Google Cloud SQL / Azure)                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Load & Performance

```
Expected Throughput:
====================
- Créations/min: 100-500 (dépend des offres/candidatures)
- Lectures/min: 1000+ (users consultant leurs notifs)
- Envois email: 50-200/min (async, rate-limited)

Performance Targets:
====================
- Latence API (p95): < 500ms
- Latence email: < 5s
- DB query (simple): < 100ms
- Uptime: > 99.9%

Scaling Strategy:
=================
1. Vertical: CPU + RAM
2. Horizontal: K8s replicas (2 → 5+)
3. DB: Connection pool + Caching
4. Email Queue: RabbitMQ/Kafka (future)
```

---

## 🎯 Résumé

✅ **Indépendant**: Propre DB, API, code  
✅ **Sécurisé**: JWT, RBAC, validation  
✅ **Scalable**: Docker, K8s, DB indexes  
✅ **Maintenable**: Structure claire, docs complètes  
✅ **Intégré**: Communication service-to-service  

---

**Dernière mise à jour** : 2026-04-07  
**Version** : 1.0.0
