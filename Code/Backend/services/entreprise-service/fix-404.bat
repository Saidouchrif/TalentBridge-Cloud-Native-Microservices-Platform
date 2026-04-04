@echo off
echo === DIAGNOSTIC ET RÉPARATION DES ERREURS 404 ===
echo.

echo 1. Insertion des données SQLite...
node.exe seed-sqlite.js

echo.
echo 2. Démarrage du serveur backend...
start "Backend" cmd /k "node.exe src/server.js"

echo 3. Attente du démarrage (5 secondes)...
timeout /t 5

echo.
echo 4. Test des endpoints...
node.exe test-endpoints.js

echo.
echo 5. Démarrage du frontend...
cd frontend
start "Frontend" cmd /k "npm run dev"

echo.
echo === SERVICES PRÊTS ===
echo Backend API: http://localhost:5002
echo Frontend: http://localhost:5173
echo.
echo Si erreur 404 persiste:
echo - Vérifiez que le backend est démarré
echo - Testez: http://localhost:5002/health
echo.
pause
