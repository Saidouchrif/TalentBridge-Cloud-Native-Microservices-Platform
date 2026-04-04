@echo off
echo Arrêt du processus node.exe éventuel...
taskkill /f /im node.exe 2>nul

echo Insertion des données de test...
node.exe quick-seed.js

echo Démarrage du serveur...
echo Le service sera disponible sur: http://localhost:5002
echo.
echo URLs de test:
echo - Entreprises: http://localhost:5002/api/entreprises
echo - Offres: http://localhost:5002/api/offers
echo - Santé: http://localhost:5002/health
echo.
node.exe src/server.js
