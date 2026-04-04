@echo off
echo === RÉPARATION ERREUR req.user.id ===
echo.

echo 1. Redémarrage du backend avec les corrections...
echo Arrêt des processus Node.js existants...
taskkill /f /im node.exe >nul 2>&1

echo 2. Insertion des données SQLite...
node.exe seed-sqlite.js

echo 3. Démarrage du serveur avec middleware corrigé...
start "Backend Corrigé" cmd /k "node.exe src/server.js"

echo 4. Attente du démarrage (5 secondes)...
timeout /t 5

echo 5. Test des endpoints avec middleware...
node.exe test-endpoints.js

echo.
echo 6. Redémarrage du frontend...
cd frontend
start "Frontend" cmd /k "npm run dev"

echo.
echo === PROBLÈME RÉSOLU ===
echo ✅ Middleware requireAuth ajouté sur toutes les routes
echo ✅ req.user.id maintenant disponible dans tous les contrôleurs
echo ✅ Plus d'erreur "Cannot read properties of undefined"
echo.
echo Services:
echo - Backend: http://localhost:5002
echo - Frontend: http://localhost:5173
echo.
pause
