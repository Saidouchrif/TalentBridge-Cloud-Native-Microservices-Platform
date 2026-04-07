@echo off
REM Script de démarrage du service notifications
REM Dépendances: Node.js 20+, npm

echo [notifications-service] Installation des dépendances...
call npm install

echo [notifications-service] Démarrage du service...
call npm run start

pause
