@echo off
echo === NETTOYAGE COMPLET DES SERVICES ===
echo.

echo 1. Arrêt des processus Node.js...
taskkill /f /im node.exe >nul 2>&1

echo 2. Nettoyage des bases de données...
cd ../entreprise-service
if exist entreprise_db.sqlite del entreprise_db.sqlite

cd ../offre-service
if exist offre_db.sqlite del offre_db.sqlite

echo 3. Nettoyage des node_modules (optionnel)...
echo Voulez-vous nettoyer node_modules? (O/N)
set /p cleanup=
if /i "%cleanup%"=="O" (
    cd ../entreprise-service
    if exist node_modules rmdir /s /q node_modules
    
    cd ../offre-service
    if exist node_modules rmdir /s /q node_modules
    
    cd ../entreprise-service/frontend
    if exist node_modules rmdir /s /q node_modules
    
    cd ../offre-service/frontend
    if exist node_modules rmdir /s /q node_modules
)

echo.
echo === NETTOYAGE TERMINÉ ===
echo.
echo Pour redémarrer proprement:
echo start-all-services.bat
echo.
pause
