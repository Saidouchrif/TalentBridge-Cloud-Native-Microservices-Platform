@echo off
echo === SOLUTION RAPIDE AVEC SQLITE ===
echo.

echo 1. Diagnostic PostgreSQL (optionnel)...
node.exe diagnose-postgres.js
echo.

echo 2. Solution avec SQLite (garantie de fonctionner)...
copy .env.sqlite .env
echo Configuration SQLite activée

echo 3. Insertion des données dans SQLite...
node.exe seed-sqlite.js

echo.
echo 4. Démarrage du serveur...
echo Service disponible sur: http://localhost:5002
echo.
echo URLs de test:
echo - Entreprises: http://localhost:5002/api/entreprises
echo - Offres: http://localhost:5002/api/offers
echo - Santé: http://localhost:5002/health
echo.
echo Base de données: entreprise_db.sqlite
echo.
node.exe src/server.js
