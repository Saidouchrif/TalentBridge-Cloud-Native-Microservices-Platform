@echo off
echo === LANCEMENT DES TESTS COMPLETS ===
echo.

echo 1. Installation des dépendances de test...
echo Installation backend...
npm install --save-dev jest supertest eslint
echo Installation frontend...
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
cd ..

echo.
echo 2. Configuration de l'environnement de test...
echo DB_DIALECT=sqlite > .env.test
echo SQLITE_STORAGE=:memory: >> .env.test
echo NODE_ENV=test >> .env.test
echo JWT_SECRET=test_secret >> .env.test

echo.
echo 3. Lancement des tests backend...
echo.
echo === TESTS BACKEND ===
npm test || echo "Tests backend terminés"

echo.
echo 4. Lancement des tests frontend...
cd frontend
echo.
echo === TESTS FRONTEND ===
npm test || echo "Tests frontend terminés"

echo.
echo 5. Test des endpoints API...
cd ..
echo.
echo === TESTS ENDPOINTS API ===
node test-endpoints.js

echo.
echo === TOUS LES TESTS TERMINÉS ===
echo.
echo Rapport de couverture disponible dans:
echo - Backend: coverage/lcov-report/index.html
echo - Frontend: coverage/lcov-report/index.html
echo.
pause
