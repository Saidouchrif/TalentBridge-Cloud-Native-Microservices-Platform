@echo off
echo === GÉNÉRATION PACKAGE-LOCK.JSON ===
echo.

echo 1. Génération pour entreprise-service...
cd entreprise-service
if not exist package-lock.json (
    echo Génération package-lock.json pour entreprise-service...
    npm install --package-lock-only
)

echo 2. Génération pour offre-service...
cd ../offre-service
if not exist package-lock.json (
    echo Génération package-lock.json pour offre-service...
    npm install --package-lock-only
)

echo 3. Génération pour frontend entreprise-service...
cd frontend
if not exist package-lock.json (
    echo Génération package-lock.json pour frontend entreprise-service...
    npm install --package-lock-only
)

echo 4. Génération pour frontend offre-service...
cd ../../offre-service/frontend
if not exist package-lock.json (
    echo Génération package-lock.json pour frontend offre-service...
    npm install --package-lock-only
)

echo 5. Génération pour la racine...
cd ../..
if not exist package-lock.json (
    echo Génération package-lock.json pour la racine...
    npm install --package-lock-only
)

echo.
echo === PACKAGE-LOCK.JSON GÉNÉRÉS ===
echo.
echo Fichiers créés:
echo - entreprise-service/package-lock.json
echo - offre-service/package-lock.json
echo - entreprise-service/frontend/package-lock.json
echo - offre-service/frontend/package-lock.json
echo - package-lock.json (racine)
echo.
echo Le CI/CD devrait maintenant fonctionner !
echo.
pause
