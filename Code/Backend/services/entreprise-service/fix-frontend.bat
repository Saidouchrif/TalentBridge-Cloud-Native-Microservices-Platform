@echo off
echo === RÉSOLUTION ERREUR 404 FRONTEND/BACKEND ===
echo.

echo 1. Vérification du backend...
curl -s http://localhost:5002/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend non démarré - Démarrage en cours...
    node.exe seed-sqlite.js
    start "Backend" cmd /k "node.exe src/server.js"
    timeout /t 5
) else (
    echo ✅ Backend déjà démarré
)

echo.
echo 2. Test de connexion API...
curl -s http://localhost:5002/api/entreprises
if %errorlevel% neq 0 (
    echo ❌ API non accessible - Vérifiez le backend
) else (
    echo ✅ API accessible
)

echo.
echo 3. Démarrage du frontend...
cd frontend
echo Configuration: VITE_API_BASE_URL=http://localhost:5002
echo.
start "Frontend" cmd /k "npm run dev"

echo.
echo === SOLUTION APPLIQUÉE ===
echo ✅ Configuration API: http://localhost:5002
echo ✅ Backend: http://localhost:5002/health
echo ✅ Frontend: http://localhost:5173
echo.
echo Si l'erreur persiste:
echo 1. Vérifiez que le backend tourne sur le port 5002
echo 2. Actualisez la page frontend (Ctrl+F5)
echo 3. Vérifiez la console navigateur (F12)
echo.
pause
