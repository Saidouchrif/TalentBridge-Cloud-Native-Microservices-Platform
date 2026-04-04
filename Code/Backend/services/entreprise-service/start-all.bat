@echo off
echo === DÉMARRAGE COMPLET FRONTEND + BACKEND ===
echo.

echo 1. Démarrage du backend avec SQLite...
copy .env.sqlite .env >nul
node.exe seed-sqlite.js
echo.

echo 2. Démarrage du serveur backend...
start "Backend Entreprise Service" cmd /k "node.exe src/server.js"

echo 3. Attente du démarrage du serveur (5 secondes)...
timeout /t 5

echo 4. Démarrage du frontend...
cd frontend
start "Frontend Entreprise Service" cmd /k "npm run dev"

echo.
echo === SERVICES DÉMARRÉS ===
echo Backend: http://localhost:5002
echo Frontend: http://localhost:5173 (ou port affiché ci-dessus)
echo.
echo Endpoints de test:
echo - Entreprises: http://localhost:5002/api/entreprises
echo - Offres: http://localhost:5002/api/offers
echo - Santé: http://localhost:5002/health
echo.
pause
