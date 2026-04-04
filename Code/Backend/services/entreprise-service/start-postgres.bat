@echo off
echo === CONFIGURATION POSTGRESQL POUR ENTREPRISE-SERVICE ===
echo.

echo 1. Démarrage de PostgreSQL avec Docker...
docker-compose up -d entreprise-postgres

echo 2. Attente du démarrage de PostgreSQL (30 secondes)...
timeout /t 30

echo 3. Insertion des données dans PostgreSQL...
node.exe seed-postgres.js

echo.
echo 4. Démarrage du serveur...
echo Service disponible sur: http://localhost:5002
echo.
echo URLs de test:
echo - Entreprises: http://localhost:5002/api/entreprises
echo - Offres: http://localhost:5002/api/offers
echo - Santé: http://localhost:5002/health
echo.
node.exe src/server.js
