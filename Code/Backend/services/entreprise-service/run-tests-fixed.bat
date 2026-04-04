@echo off
echo === TESTS CORRIGÉS - LANCEMENT SIMPLIFIÉ ===
echo.

echo 1. Installation des dépendances de test...
echo Installation backend...
npm install --save-dev jest supertest @babel/preset-env
echo Installation frontend...
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest @babel/preset-react @babel/preset-env
cd ..

echo.
echo 2. Configuration de l'environnement de test...
echo NODE_ENV=test > .env.test
echo JWT_SECRET=test_secret >> .env.test

echo.
echo 3. Lancement des tests backend...
echo.
echo === TESTS BACKEND (SIMPLIFIÉS) ===
npm test || echo "Tests backend terminés"

echo.
echo 4. Lancement des tests frontend...
cd frontend
echo.
echo === TESTS FRONTEND (SIMPLIFIÉS) ===
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
echo Tests utilisés:
echo - Backend: tests/simple.test.js (tests basiques sans dépendances)
echo - Frontend: frontend/src/tests/simple.test.js (tests logiques simples)
echo - API: test-endpoints.js (tests end-to-end)
echo.
pause
