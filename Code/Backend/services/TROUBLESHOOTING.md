# Guide de Dépannage - Erreurs Communes

## 🚨 Erreurs Fréquentes et Solutions

### 1. **ERREUR: ECONNREFUSED**
**Message**: `connect ECONNREFUSED 127.0.0.1:5002`

**Cause**: Service non démarré

**Solution**:
```bash
# Démarrer les services
start-all-services.bat

# Ou individuellement
cd entreprise-service
node.exe src/server.js
```

### 2. **ERREUR: PORT DÉJÀ UTILISÉ**
**Message**: `listen EADDRINUSE :::5002`

**Cause**: Port déjà occupé

**Solution**:
```bash
# Tuer les processus Node.js
taskkill /f /im node.exe

# Ou changer de port dans .env
PORT=5004
```

### 3. **ERREUR: MODULE NOT FOUND**
**Message**: `Error: Cannot find module 'express'`

**Cause**: Dépendances non installées

**Solution**:
```bash
# Installer toutes les dépendances
install-all-services.bat

# Ou manuellement
cd entreprise-service
npm install

cd ../offre-service
npm install
```

### 4. **ERREUR: BASE DE DONNÉES VIDE**
**Message**: `No enterprises found` ou `No offers found`

**Cause**: Base de données non peuplée

**Solution**:
```bash
# Peupler les bases de données
cd entreprise-service
node.exe seed-sqlite.js

cd ../offre-service
node.exe seed-sqlite.js
```

### 5. **ERREUR: CANNOT READ PROPERTIES OF UNDEFINED**
**Message**: `Cannot read properties of undefined (reading 'id')`

**Cause**: req.user non défini

**Solution**:
```bash
# Le middleware requireAuth gère cela automatiquement
# Si l'erreur persiste, vérifiez le middleware:
cd entreprise-service/src/middlewares/requireAuth.js
cd ../offre-service/src/middlewares/requireAuth.js
```

### 6. **ERREUR: ENTREPRISE INTROUVABLE**
**Message**: `Entreprise introuvable` lors de création d'offre

**Cause**: entreprise-service non accessible

**Solution**:
```bash
# Vérifier que entreprise-service tourne sur port 5002
curl http://localhost:5002/health

# Redémarrer entreprise-service
cd entreprise-service
node.exe src/server.js
```

### 7. **ERREUR: FRONTEND NE SE CHARGE PAS**
**Message**: Page blanche ou erreur 404

**Cause**: Frontend non démarré ou mauvais port

**Solution**:
```bash
# Démarrer les frontends
cd entreprise-service/frontend
npm run dev

cd ../../offre-service/frontend
npm run dev
```

### 8. **ERREUR: CORS**
**Message**: `Access-Control-Allow-Origin`

**Cause**: Configuration CORS

**Solution**:
```bash
# Les services sont configurés avec CORS: "*"
# Si problème, vérifiez la configuration dans server.js
```

## 🔧 Scripts de Réparation Rapide

### Réparation Complète
```bash
# Diagnostic et réparation automatiques
fix-errors.bat
```

### Réparation Manuelle
```bash
# 1. Nettoyer tout
cleanup-services.bat

# 2. Réinstaller
install-all-services.bat

# 3. Redémarrer
start-all-services.bat
```

## 🧪 Tests de Vérification

### Test de Santé des Services
```bash
# Test santé entreprise-service
curl http://localhost:5002/health

# Test santé offre-service
curl http://localhost:5003/health
```

### Test Communication Inter-Services
```bash
# Test vérification entreprise
curl http://localhost:5003/api/enterprises/1/exists
```

### Test des Frontends
```bash
# Ouvrir dans le navigateur:
http://localhost:5173  # Entreprise frontend
http://localhost:5174  # Offre frontend
```

## 📋 Checklist de Vérification

Avant de demander de l'aide, vérifiez:

- [ ] Les deux services backend sont démarrés
- [ ] Les deux frontends sont démarrés
- [ ] Les ports 5002, 5003, 5173, 5174 sont libres
- [ ] Les bases de données sont peuplées
- [ ] Les dépendances sont installées
- [ ] La communication inter-services fonctionne

## 🆘 Si l'Erreur Persiste

1. **Copiez le message d'erreur complet**
2. **Exécutez le diagnostic**:
   ```bash
   diagnostic-services.bat
   ```
3. **Vérifiez les logs** des services
4. **Redémarrez proprement**:
   ```bash
   cleanup-services.bat
   start-all-services.bat
   ```

---

**Pour une aide rapide, veuillez fournir:**
- Le message d'erreur exact
- Le script/commande qui a causé l'erreur
- Le résultat de `diagnostic-services.bat`
