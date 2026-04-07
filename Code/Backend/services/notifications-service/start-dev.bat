@echo off
REM Script de démarrage en mode développement
REM Utilise nodemon pour hot reload

echo [notifications-service] Installation des dépendances...
call npm install

echo [notifications-service] Démarrage en mode développement (nodemon)...
call npm run dev

pause
