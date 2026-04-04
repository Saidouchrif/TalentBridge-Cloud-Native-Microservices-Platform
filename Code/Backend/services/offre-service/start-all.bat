@echo off
echo === DÉMARRAGE COMPLET OFFRE-SERVICE ===
echo.

echo 1. Démarrage du backend avec SQLite...
copy .env.sqlite .env >nul
node.exe seed-sqlite.js
echo.

echo 2. Démarrage du serveur backend...
start "Offre Service Backend" cmd /k "node.exe src/server.js"

echo 3. Attente du démarrage du serveur (5 secondes)...
timeout /t 5

echo 4. Démarrage du frontend...
cd frontend
start "Offre Service Frontend" cmd /k "npm run dev"

echo.
echo === SERVICES DÉMARRÉS ===
echo Backend API: http://localhost:5003
echo Frontend: http://localhost:5174 (ou port affiché ci-dessus)
echo Health: http://localhost:5003/health
echo.
echo Endpoints de test:
echo - Offres: http://localhost:5003/api/offers
echo - Offres filtrées: http://localhost:5003/api/offers?status=published
echo - Candidatures: http://localhost:5003/api/offers/1/applications
echo.
pause
