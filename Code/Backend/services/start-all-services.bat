@echo off
echo === DÉMARRAGE COMPLET DES DEUX SERVICES ===
echo.

echo 1. Démarrage de entreprise-service (port 5002)...
cd ../entreprise-service
copy .env.sqlite .env >nul
node.exe seed-sqlite.js
start "Entreprise Service" cmd /k "node.exe src/server.js"

echo 2. Attente du démarrage d'entreprise-service (5 secondes)...
timeout /t 5

echo 3. Démarrage de offre-service (port 5003)...
cd ../offre-service
copy .env.sqlite .env >nul
node.exe seed-sqlite.js
start "Offre Service" cmd /k "node.exe src/server.js"

echo 4. Attente du démarrage d'offre-service (5 secondes)...
timeout /t 5

echo 5. Démarrage des frontends...
cd ../entreprise-service/frontend
start "Entreprise Frontend" cmd /k "npm run dev"

cd ../offre-service/frontend
start "Offre Frontend" cmd /k "npm run dev"

echo.
echo === TOUS LES SERVICES DÉMARRÉS ===
echo.
echo Services Backend:
echo - Entreprise Service: http://localhost:5002
echo - Offre Service: http://localhost:5003
echo.
echo Services Frontend:
echo - Entreprise Frontend: http://localhost:5173
echo - Offre Frontend: http://localhost:5174
echo.
echo Tests:
echo - Entreprise: http://localhost:5002/health
echo - Offres: http://localhost:5003/health
echo.
echo Les deux services communiquent via des APIs REST!
echo.
pause
