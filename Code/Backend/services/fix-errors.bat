@echo off
echo === RÉSOLUTION ERREURS COMMUNES ===
echo.

echo 1. Vérification des erreurs possibles...
echo.

echo === ERREUR 1: PORTS DÉJÀ UTILISÉS ===
netstat -an | findstr ":5002"
netstat -an | findstr ":5003"
netstat -an | findstr ":5173"
netstat -an | findstr ":5174"

echo.
echo === ERREUR 2: SERVICES NON DÉMARRÉS ===
curl -s http://localhost:5002/health || echo ❌ entreprise-service KO
curl -s http://localhost:5003/health || echo ❌ offre-service KO

echo.
echo === ERREUR 3: BASES DE DONNÉES MANQUANTES ===
if exist ..\entreprise-service\entreprise_db.sqlite (
    echo ✅ entreprise_db.sqlite OK
) else (
    echo ❌ entreprise_db.sqlite MANQUANT
)

if exist ..\offre-service\offre_db.sqlite (
    echo ✅ offre_db.sqlite OK
) else (
    echo ❌ offre_db.sqlite MANQUANT
)

echo.
echo === ERREUR 4: DÉPENDANCES MANQUANTES ===
if exist ..\entreprise-service\node_modules (
    echo ✅ entreprise-service node_modules OK
) else (
    echo ❌ entreprise-service node_modules MANQUANT
)

if exist ..\offre-service\node_modules (
    echo ✅ offre-service node_modules OK
) else (
    echo ❌ offre-service node_modules MANQUANT
)

echo.
echo === ERREUR 5: FRONTEND DÉPENDANCES ===
if exist ..\entreprise-service\frontend\node_modules (
    echo ✅ entreprise-frontend node_modules OK
) else (
    echo ❌ entreprise-frontend node_modules MANQUANT
)

if exist ..\offre-service\frontend\node_modules (
    echo ✅ offre-frontend node_modules OK
) else (
    echo ❌ offre-frontend node_modules MANQUANT
)

echo.
echo === SOLUTIONS AUTOMATIQUES ===
echo.

echo 1. Installation des dépendances manquantes...
if not exist ..\entreprise-service\node_modules (
    echo Installation entreprise-service...
    cd ..\entreprise-service
    npm install
)

if not exist ..\offre-service\node_modules (
    echo Installation offre-service...
    cd ..\offre-service
    npm install
)

if not exist ..\entreprise-service\frontend\node_modules (
    echo Installation entreprise-frontend...
    cd ..\entreprise-service\frontend
    npm install
)

if not exist ..\offre-service\frontend\node_modules (
    echo Installation offre-frontend...
    cd ..\offre-service\frontend
    npm install
)

echo.
echo 2. Création des bases de données...
if not exist ..\entreprise-service\entreprise_db.sqlite (
    echo Création BD entreprise...
    cd ..\entreprise-service
    copy .env.sqlite .env >nul
    node.exe seed-sqlite.js
)

if not exist ..\offre-service\offre_db.sqlite (
    echo Création BD offres...
    cd ..\offre-service
    copy .env.sqlite .env >nul
    node.exe seed-sqlite.js
)

echo.
echo 3. Arrêt des processus existants...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 4. Redémarrage des services...
cd ..\entreprise-service
start "Entreprise Service" cmd /k "node.exe src/server.js"

timeout /t 3

cd ..\offre-service
start "Offre Service" cmd /k "node.exe src/server.js"

timeout /t 3

cd ..\entreprise-service\frontend
start "Entreprise Frontend" cmd /k "npm run dev"

cd ..\..\offre-service\frontend
start "Offre Frontend" cmd /k "npm run dev"

echo.
echo === RÉPARATION TERMINÉE ===
echo.
echo URLs:
echo - Entreprise Backend: http://localhost:5002
echo - Offre Backend: http://localhost:5003
echo - Entreprise Frontend: http://localhost:5173
echo - Offre Frontend: http://localhost:5174
echo.
pause
