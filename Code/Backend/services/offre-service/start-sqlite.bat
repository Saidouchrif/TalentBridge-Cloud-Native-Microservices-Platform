@echo off
echo === DÉMARRAGE OFFRE-SERVICE AVEC SQLITE ===
echo.

echo 1. Configuration SQLite...
copy .env.sqlite .env >nul

echo 2. Peuplement de la base de données...
node.exe seed-sqlite.js

echo.
echo 3. Démarrage du service offre-service...
start "Offre Service" cmd /k "node.exe src/server.js"

echo.
echo === OFFRE-SERVICE DÉMARRÉ ===
echo Backend API: http://localhost:5003
echo Health Check: http://localhost:5003/health
echo.
echo Assurez-vous que entreprise-service est démarré sur le port 5002
echo.
pause
