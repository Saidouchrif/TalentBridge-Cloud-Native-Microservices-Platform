# Notifications Service - Test API avec cURL

Ce fichier contient des exemples de requêtes pour tester l'API du notifications-service.

## Base URL

```
http://localhost:5003/api/notifications
```

## Interface front-end de test

Une UI légère est disponible directement depuis le service :

```
http://localhost:5003/
```

Cette interface utilise les mêmes headers personnalisés que les appels API.

## Headers d'authentification

Le service utilise des headers personnalisés pour l'authentification (pas de JWT) :

```
-H "X-User-ID: 1"
-H "X-User-Role: admin"
-H "X-User-Email: test@example.com"
```

Ces headers sont **toujours requis** pour les endpoints nécessitant une authentification.

---

## 📝 Exemples de requêtes

### 1. Health Check

```bash
curl http://localhost:5003/health
```

**Response** :
```json
{
  "status": "Notifications Service running"
}
```

---

### 2. Créer une notification (Admin only)

```bash
curl -X POST http://localhost:5003/api/notifications \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -H "X-User-Role: admin" \
  -H "X-User-Email: admin@talentbridge.com" \
  -d '{
    "userId": 5,
    "type": "new_offer",
    "message": "Nouvelle offre: Développeur Full-Stack React/Node",
    "canal": "email",
    "priority": "high",
    "relatedEntityId": 42,
    "relatedEntityType": "offer"
  }'
```

**Response** (201 Created):
```json
{
  "notification": {
    "id": 1,
    "userId": 5,
    "type": "new_offer",
    "message": "Nouvelle offre: Développeur Full-Stack React/Node",
    "canal": "email",
    "statut": "pending",
    "priority": "high",
    "relatedEntityId": 42,
    "relatedEntityType": "offer",
    "readAt": null,
    "sentAt": null,
    "createdAt": "2026-04-07T10:30:00.000Z",
    "updatedAt": "2026-04-07T10:30:00.000Z"
  }
}
```

---

### 3. Récupérer les notifications de l'utilisateur connecté

```bash
curl http://localhost:5003/api/notifications \
  -H "X-User-ID: 1" \
  -H "X-User-Role: student"
```

---

### 3.1 Avec pagination

```bash
curl "http://localhost:5003/api/notifications?limit=10&offset=0" \
  -H "X-User-ID: 1"
```

---

### 3.2 Filtrer par statut

```bash
curl "http://localhost:5003/api/notifications?statut=pending" \
  -H "X-User-ID: 1"
```

**Response** :
```json
{
  "notifications": [
    {
      "id": 1,
      "userId": 1,
      "type": "registration",
      "message": "Bienvenue sur TalentBridge!",
      "canal": "in-app",
      "statut": "pending",
      "priority": "normal",
      "createdAt": "2026-04-07T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

---

### 4. Récupérer une notification spécifique

```bash
curl http://localhost:5003/api/notifications/1 \
  -H "X-User-ID: 1"
```

---

### 5. Marquer une notification comme lue

```bash
curl -X PATCH http://localhost:5003/api/notifications/1/read \
  -H "X-User-ID: 1"
```

**Response** :
```json
{
  "notification": {
    "id": 1,
    "statut": "read",
    "readAt": "2026-04-07T10:35:00.000Z"
  }
}
```

---

### 6. Marquer comme non lue

```bash
curl -X PATCH http://localhost:5003/api/notifications/1/unread \
  -H "X-User-ID: 1"
```

---

### 7. Compter les notifications non lues

```bash
curl http://localhost:5003/api/notifications/unread/count \
  -H "X-User-ID: 1"
```

**Response** :
```json
{
  "unreadCount": 3
}
```

---

### 8. Supprimer une notification (soft delete)

```bash
curl -X DELETE http://localhost:5003/api/notifications/1 \
  -H "X-User-ID: 1"
```

**Response** :
```json
{
  "message": "Notification supprimée"
}
```

---

### 9. Récupérer les préférences de notification

```bash
curl http://localhost:5003/api/notifications/preferences \
  -H "X-User-ID: 1"
```

**Response** :
```json
{
  "preferences": {
    "id": 1,
    "userId": 1,
    "emailEnabled": true,
    "inAppEnabled": true,
    "pushEnabled": false,
    "preferredLanguage": "fr",
    "notificationFrequency": "immediate",
    "createdAt": "2026-04-07T10:00:00.000Z",
    "updatedAt": "2026-04-07T10:00:00.000Z"
  }
}
```

---

### 10. Mettre à jour les préférences

```bash
curl -X PUT http://localhost:5003/api/notifications/preferences \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -d '{
    "emailEnabled": true,
    "inAppEnabled": false,
    "pushEnabled": true,
    "preferredLanguage": "en",
    "notificationFrequency": "daily_summary"
  }'
```

**Response** :
```json
{
  "preferences": {
    "id": 1,
    "userId": 1,
    "emailEnabled": true,
    "inAppEnabled": false,
    "pushEnabled": true,
    "preferredLanguage": "en",
    "notificationFrequency": "daily_summary",
    "updatedAt": "2026-04-07T10:40:00.000Z"
  }
}
```

---

## 🧪 Script Bash pour automation

Créer `test-api.sh` :

```bash
#!/bin/bash

BASE_URL="http://localhost:5003/api/notifications"
USER_ID="1"
USER_ROLE="admin"

echo "=== Test Health Check ==="
curl $BASE_URL/../health

echo "\n=== Créer une notification ==="
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -H "X-User-ID: $USER_ID" \
  -H "X-User-Role: $USER_ROLE" \
  -d '{
    "userId": 5,
    "type": "registration",
    "message": "Test notification",
    "canal": "in-app"
  }' | jq

echo "\n=== Récupérer notifications ==="
curl $BASE_URL \
  -H "X-User-ID: $USER_ID" | jq

echo "\n=== Compter non-lues ==="
curl "$BASE_URL/unread/count" \
  -H "X-User-ID: $USER_ID" | jq
```

Exécuter :

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 🐚 Script PowerShell (Windows)

Créer `test-api.ps1` :

```powershell
$BaseUrl = "http://localhost:5003/api/notifications"
$Headers = @{
    "Content-Type" = "application/json"
    "X-User-ID" = "1"
    "X-User-Role" = "admin"
}

Write-Host "=== Health Check ===" -ForegroundColor Green
Invoke-RestMethod -Uri "$BaseUrl/../health" -Method Get | ConvertTo-Json

Write-Host "`n=== Créer notification ===" -ForegroundColor Green
$Body = @{
    userId = 5
    type = "registration"
    message = "Test notification"
    canal = "in-app"
} | ConvertTo-Json

Invoke-RestMethod -Uri $BaseUrl -Method Post -Headers $Headers -Body $Body | ConvertTo-Json

Write-Host "`n=== Récupérer notifications ===" -ForegroundColor Green
Invoke-RestMethod -Uri $BaseUrl -Method Get -Headers $Headers | ConvertTo-Json
```

Exécuter :

```powershell
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

---

## 📊 Postman Collection

Importer cette collection dans Postman :

```json
{
  "info": {
    "name": "Notifications Service API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/health"
      }
    },
    {
      "name": "Get Notifications",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/notifications",
        "header": [
          {
            "key": "X-User-ID",
            "value": "1"
          }
        ]
      }
    },
    {
      "name": "Create Notification",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/notifications",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "X-User-ID",
            "value": "1"
          },
          {
            "key": "X-User-Role",
            "value": "admin"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"userId\": 5, \"type\": \"new_offer\", \"message\": \"Test\", \"canal\": \"email\"}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5003"
    }
  ]
}
```

---

**Tips** :

- Utiliser `jq` pour formater en pretty JSON : `curl ... | jq`
- Utiliser `-v` (verbose) pour voir les headers : `curl -v ...`
- Utiliser `-w` pour voir le statut HTTP : `curl -w "\nStatus: %{http_code}\n" ...`
