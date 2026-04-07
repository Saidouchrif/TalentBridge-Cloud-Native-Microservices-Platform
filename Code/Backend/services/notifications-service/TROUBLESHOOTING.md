# 🐛 Troubleshooting - Notifications Service

## Problèmes courants et solutions

### 1. Erreur: "Connection refused on port 5432"

**Symptôme** : Service ne peut pas se connecter à PostgreSQL

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions** :

1. **Vérifier PostgreSQL est lancé** :
```bash
# Avec Docker Compose
docker-compose up -d postgres
docker-compose logs postgres

# Avec installations locales
psql -U postgres -c "SELECT 1"
```

2. **Vérifier les variables d'environnement** :
```bash
# Vérifier .env
cat .env | grep DB_

# DB_HOST doit être localhost (local) ou postgres (Docker)
```

3. **Attendre le démarrage de PostgreSQL** :
Le service essaie 15 fois avec 2s entre chaque. Attendre ~30s au premier démarrage.

---

### 2. Erreur: "Cannot find module 'sequelize'"

**Symptôme** :
```
Error: Cannot find module 'sequelize'
```

**Solutions** :

```bash
# Réinstaller les dépendances
npm install

# Ou forcer une clean install
rm -rf node_modules package-lock.json
npm install
```

---

### 3. Tests échouent avec erreur SQLite

**Symptôme** :
```
Error: SQLITE_CANTOPEN
```

**Solutions** :

1. **S'assurer que NODE_ENV=test** :
```bash
NODE_ENV=test npm test
```

2. **Vérifier les permissions du dossier** :
```bash
chmod 755 .
ls -la
```

3. **Supprimer les BD de test** :
```bash
rm -f test.sqlite test.db
npm test
```

---

### 4. Erreur: "JWT Secret not defined"

**Symptôme** :
```
Error: JWT_SECRET environment variable is not set
```

**Solutions** :

1. **Créer un JWT_SECRET** :
```bash
# Dans .env
JWT_SECRET=your-secret-key-here-at-least-32-chars

# Ou générer
openssl rand -base64 32
```

2. **En mode test, JWT est optionnel** :
```bash
NODE_ENV=test npm test  # Ne requiert pas JWT_SECRET
```

---

### 5. Erreur: "Rate limit exceeded" (Gmail SMTP)

**Symptôme** :
```
Error: too many login attempts
```

**Solutions** :

1. **Utiliser App Passwords au lieu du mot de passe** :
   - Activer 2FA sur Google Account
   - Créer une "App Password" : https://myaccount.google.com/apppasswords
   - Utiliser dans `SMTP_PASSWORD`

2. **Utiliser Email Provider = test** :
```bash
EMAIL_PROVIDER=test  # Dev/test mode
```

3. **Changer de provider SMTP** :
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx
```

---

### 6. Notification créée mais jamais envoyée (statut = pending)

**Symptômes** : 
```json
{
  "id": 1,
  "statut": "pending",
  "sentAt": null
}
```

**Raisons** :

1. **Email Provider = test** (intentionnel, dev only)
   - Les emails ne sont pas réellement envoyés
   - Prévu pour le développement

2. **SMTP non configuré** :
```bash
# Vérifier la config
echo $SMTP_HOST
echo $EMAIL_PROVIDER
```

3. **Notification n'a jamais déclenché d'envoi email** :
   - Le service crée juste la notification en BD
   - L'envoi email doit être déclenché manuellement ou via cron
   - Voir `src/services/emailService.js` pour ajouter un worker

**Solutions** :

- Implémenter un **job async** (RabbitMQ, Bull Queue) pour envoyer les emails
- Ou appeler manuellement dans un endpoint admin

---

### 7. Docker Compose: Service ne démarre pas

**Symptôme** :
```
docker-compose up
ERROR: ... "notifications-service" service ... exited with code 1
```

**Solutions** :

1. **Vérifier les logs** :
```bash
docker-compose logs notifications-service --tail 50
```

2. **Vérifier les ports ne sont pas en usage** :
```bash
# Port 5003 utilisé?
netstat -an | grep 5003
lsof -i :5003
```

3. **Nettoyer et relancer** :
```bash
docker-compose down -v  # Remove volumes
docker-compose up --build
```

---

### 8. Migration PostgreSQL échoue

**Symptôme** :
```
Sequelize migration error
```

**Solutions** :

1. **Vérifier la connexion BD** :
```bash
psql -h localhost -U postgres -d notifications_db -c "SELECT 1"
```

2. **Réinitialiser la BD** (dev only) :
```bash
# Supprimer et recréer (attention: data loss!)
dropdb -U postgres notifications_db
createdb -U postgres notifications_db
npm start
```

---

### 9. Authentification échoue: "Token manquant"

**Symptôme** :
```json
{
  "message": "Token manquant. Authentification requise."
}
```

**Solutions** :

1. **Ajouter le header Authorization** :
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5003/api/notifications
```

2. **En mode test, utiliser X-User-* headers** :
```bash
curl \
  -H "X-User-ID: 1" \
  -H "X-User-Role: student" \
  -H "X-User-Email: test@example.com" \
  http://localhost:5003/api/notifications
```

3. **Vérifier NODE_ENV** :
```bash
# En test, JWT est optionnel
NODE_ENV=test npm start
```

---

### 10. Erreur CORS

**Symptôme** :
```
Access to XMLHttpRequest from origin has been blocked by CORS policy
```

**Solutions** :

1. **Configurer CORS_ORIGIN** :
```bash
# .env
CORS_ORIGIN=http://localhost:3000,http://localhost:5000

# Ou permettre tous (dev only)
CORS_ORIGIN=*
```

2. **Vérifier les headers du serveur** :
```bash
curl -v http://localhost:5003/health
# Regarder Access-Control-Allow-Origin: *
```

---

### 11. Prisma/Sequelize: Tables non créées

**Symptôme** :
```
relation "notifications" does not exist
```

**Solutions** :

```bash
# Forcer sequelize.sync()
rm -rf node_modules
npm install
npm start  # Relancer, va faire sync automatiquement

# Ou manuellement
node -e "require('./src/Models').sequelize.sync()"
```

---

### 12. Service lent/timeout (> 30s)

**Raisons possibles** :

1. **DB query lente** :
```javascript
// Ajouter LIMIT et OFFSET pour pagination
SELECT * FROM notifications WHERE userId = 1 LIMIT 50 OFFSET 0;
```

2. **Pas d'index sur userId** :
```javascript
// Vérifier dans Models/Notification.js
// userId doit avoir { index: true }
```

3. **Trop de données** :
```bash
# Vérifier la taille de la BD
SELECT COUNT(*) FROM notifications;  # Limiter si > 100k
```

---

## 📞 Support

Pour plus d'aide :

1. Vérifier les **logs** : `docker-compose logs -f notifications-service`
2. Vérifier la **configuration** : `cat .env`
3. Consulter la **doc API** : [README.md](./README.md)
4. Consulter le **guide d'intégration** : [INTEGRATION.md](./INTEGRATION.md)

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2026-04-07
