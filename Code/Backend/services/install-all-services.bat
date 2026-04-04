@echo off
echo === INSTALLATION COMPLÈTE DES SERVICES ===
echo.

echo 1. Installation dépendances entreprise-service...
cd ../entreprise-service
npm install
cd frontend
npm install
cd ../..

echo 2. Installation dépendances offre-service...
cd offre-service
npm install
cd frontend
npm install
cd ..

echo 3. Configuration environnement...
cd ../entreprise-service
copy .env.sqlite .env >nul

cd ../offre-service
copy .env.sqlite .env >nul

echo.
echo 4. Peuplement bases de données...
cd ../entreprise-service
node.exe seed-sqlite.js

cd ../offre-service
node.exe seed-sqlite.js

echo.
echo === INSTALLATION TERMINÉE ===
echo.
echo Pour démarrer les services:
echo start-all-services.bat
echo.
echo Pour tester les services:
echo test-all-services.bat
echo.
pause
