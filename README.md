# TalentBridge - Cloud Native Microservices Platform ✅

## Overview
TalentBridge connects talents and companies with intelligent matching, AI CV/letter generation, application tracking. Full microservices architecture with Docker, future K8s-ready.

## Architecture
- **Backend**: Node.js/Express/Sequelize/Postgres microservices (auth, candidature, ai-docs), API Gateway
- **Frontend**: React 18 + Vite + Router
- **AI**: Google Gemini for CV/letters generation
- **DB**: Postgres with PgAdmin

## Quick Start
1. Copy env:
   ```
   cp .env.example Code/Backend/.env
   # Edit GEMINI_API_KEY, JWT_SECRET
   ```
2. Backend:
   ```
   cd Code/Backend
   docker-compose up --build -d
   ```
3. Frontend:
   ```
   cd ../Frontend
   npm install
   npm run dev
   ```
   Open http://localhost:5173/login

4. PgAdmin: http://localhost:8080 (admin@talentbridge.com / admin)

## Features
- User register/login with roles (student/company)
- Postuler offre with AI CV/letter generator
- Track applications status
- Protected routes, JWT auth across services

## Endpoints (via Gateway localhost:5000)
- POST /api/auth/register {email, password, role}
- POST /api/auth/login {email, password}
- POST /api/candidatures/apply {jobTitle, company, cv, letter}
- POST /api/ai/api/generate-cv {userData, jobDesc}
- GET /api/candidatures/history

## TODO Advanced
- Unit/integration tests
- Kubernetes manifests
- CI/CD GitHub Actions
- Load testing

**Project fully operational!**
