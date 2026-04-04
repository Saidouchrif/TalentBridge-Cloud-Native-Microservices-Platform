@echo off
echo === DIAGNOSTIC DES SERVICES MICROSERVICES ===
echo.

echo 1. Vérification des ports utilisés...
echo Ports 5002 (entreprise-service) et 5003 (offre-service):
netstat -an | findstr ":5002"
netstat -an | findstr ":5003"

echo.
echo 2. Test de santé des services...
echo.
echo === ENTREPRISE-SERVICE ===
curl -s http://localhost:5002/health || echo ❌ entreprise-service non accessible

echo.
echo === OFFRE-SERVICE ===
curl -s http://localhost:5003/health || echo ❌ offre-service non accessible

echo.
echo 3. Test de communication inter-services...
echo.
echo Test vérification entreprise depuis offre-service:
curl -s http://localhost:5003/api/enterprises/1/exists || echo ❌ Communication inter-services KO

echo.
echo 4. Vérification des bases de données...
echo.
echo Fichier entreprise_db.sqlite:
if exist ../entreprise-service/entreprise_db.sqlite (
    echo ✅ entreprise_db.sqlite présent
) else (
    echo ❌ entreprise_db.sqlite manquant
)

echo Fichier offre_db.sqlite:
if exist ../offre-service/offre_db.sqlite (
    echo ✅ offre_db.sqlite présent
) else (
    echo ❌ offre_db.sqlite manquant
)

echo.
echo 5. Test des endpoints principaux...
echo.
echo Entreprises:
curl -s http://localhost:5002/api/entreprises | head -c 100

echo.
echo.
echo Offres:
curl -s http://localhost:5003/api/offers | head -c 100

echo.
echo.
echo === DIAGNOSTIC TERMINÉ ===
echo.
echo Si des erreurs sont présentes:
echo 1. Vérifiez que les services sont démarrés
echo 2. Lancez: start-all-services.bat
echo 3. Consultez les logs des services
echo.
pause
