@echo off
echo === TESTS COMPLETS DES DEUX SERVICES ===
echo.

echo 1. Test entreprise-service...
cd ../entreprise-service
echo.
echo === TEST ENTREPRISE-SERVICE ===
node test-endpoints.js

echo.
echo 2. Test offre-service...
cd ../offre-service
echo.
echo === TEST OFFRE-SERVICE ===
node test-endpoints.js

echo.
echo 3. Test communication entre services...
echo Test de vérification d'entreprise depuis offre-service...
curl -s http://localhost:5003/api/enterprises/1/exists

echo.
echo.
echo === TOUS LES TESTS TERMINÉS ===
echo.
pause
