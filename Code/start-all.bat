@echo off
echo ===================================================
echo   🚀 Lancement de TalentBridge (Microservices) 🚀
echo ===================================================

echo Lancement de l'API Gateway...
start "API Gateway (5000)" cmd /k "cd Backend\api-gateway && npm install && npm run dev"

echo Lancement du Auth Service...
start "Auth Service (5001)" cmd /k "cd Backend\services\auth-service && npm install && npm run dev"

echo Lancement du Candidature Service...
start "Candidature Service (5002)" cmd /k "cd Backend\services\candidature-service && npm install && npm run dev"

echo Lancement du AI Document Service...
start "AI Service (5003)" cmd /k "cd Backend\services\ai-document-service && npm install && npm run dev"

echo Lancement du Frontend React...
start "Frontend (5173)" cmd /k "cd Frontend && npm install && npm run dev"