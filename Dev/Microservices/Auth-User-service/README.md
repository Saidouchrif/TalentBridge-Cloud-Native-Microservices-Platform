# Auth-User Service - TalentBridge

## 1) Objectif

Ce microservice gere l'authentification et la gestion des utilisateurs pour TalentBridge.
Il est pense comme base backend pour brancher un Frontend React securise et les autres microservices.

Fonctionnalites:
- register / login / refresh / logout (JWT)
- gestion utilisateurs (profil, update, liste admin, soft delete, restore)
- roles metier: `admin`, `entreprise`, `etudiant`
- forgot password par email + reset token usage unique
- verification email (resend + verify token)

---

## 2) Stack

- FastAPI
- SQLAlchemy
- PostgreSQL
- passlib + bcrypt
- python-jose
- Pydantic
- Pytest

---

## 3) Architecture

```text
Auth-User-service/
├─ config/
│  └─ database.py
├─ Controller/
│  ├─ AuthController.py
│  └─ UserController.py
├─ dependencies/
│  └─ AuthDependencies.py
├─ Model/
│  └─ User.py
├─ Routes/
│  ├─ AuthRoute.py
│  ├─ UserRoutes.py
│  └─ index.py
├─ Schemas/
│  ├─ AuthSchema.py
│  └─ UserSchema.py
├─ tests/
│  ├─ conftest.py
│  ├─ test_system_routes.py
│  ├─ test_auth_routes.py
│  ├─ test_user_routes.py
│  └─ test_service_controllers.py
├─ main.py
├─ requirements.txt
└─ .env
```

---

## 4) Modele User

Fichier: `Model/User.py`

- `id: int`
- `nom: string`
- `prenom: string`
- `email: string` (unique)
- `motDePasse: string` (hash)
- `role: enum` (`admin`, `entreprise`, `etudiant`)
- `email_verifie: bool`
- `email_verifie_at: datetime | null`
- `created_at: datetime`
- `updated_at: datetime`
- `deleted_at: datetime | null`

Table: `utilisateurs`

### SQL migration (si table deja existante)

```sql
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS email_verifie BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS email_verifie_at TIMESTAMPTZ NULL;
```

---

## 5) Variables d'environnement

```env
DATABASE_URL=postgresql://talentbridge_user:talentbridge_password@postgres_db:5432/user_db
SECRET_KEY=super_secret_key_123456
REFRESH_SECRET_KEY=super_refresh_secret_key_123456
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
REFRESH_TOKEN_EXPIRE_DAYS=7

RESET_PASSWORD_SECRET_KEY=super_reset_secret_key_123456
RESET_TOKEN_EXPIRE_MINUTES=30
RESET_PASSWORD_URL=http://localhost:5173/reset-password

EMAIL_VERIFICATION_SECRET_KEY=super_verify_secret_key_123456
VERIFY_EMAIL_TOKEN_EXPIRE_MINUTES=1440
EMAIL_VERIFICATION_URL=http://localhost:5173/verify-email
PLATFORM_LOGO_URL=http://localhost:5173/logo-talentbridge.png
REQUIRE_EMAIL_VERIFICATION_ON_LOGIN=false

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=systemtalentbridge@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=systemtalentbridge@gmail.com
SMTP_USE_TLS=true
SMTP_USE_SSL=false

ENV=docker
```

---

## 6) Securite appliquee

- hash password avec bcrypt
- JWT access + refresh
- payload JWT metier: `user_id`, `role`
- token revocation au logout
- validation email metier (regex + normalisation)
- reset token scope `reset_password` et usage unique
- verify email token scope `verify_email` et usage unique
- blocage soft-deleted users
- option de blocage login si email non verifie (`REQUIRE_EMAIL_VERIFICATION_ON_LOGIN=true`)

---

## 7) Routes API completes

Base: `/api`

### System
- `GET /`
- `GET /health`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/create-user` (admin)
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/reset-password-with-token`
- `POST /api/auth/resend-verification-email`
- `POST /api/auth/verify-email`

### Utilisateurs
- `GET /api/utilisateurs/profile`
- `PUT /api/utilisateurs/profile`
- `GET /api/utilisateurs/` (admin)
- `GET /api/utilisateurs/supprimes` (admin)
- `GET /api/utilisateurs/{user_id}` (admin)
- `PUT /api/utilisateurs/{user_id}` (admin)
- `DELETE /api/utilisateurs/{user_id}` (admin)
- `PATCH /api/utilisateurs/{user_id}/restore` (admin)

---

## 8) JSON payloads (Postman / Frontend)

### Register
```json
{
  "nom": "Register",
  "prenom": "User",
  "email": "register.user@talentbridge.com",
  "motDePasse": "RegisterPass123!",
  "role": "etudiant"
}
```

### Login
```json
{
  "email": "register.user@talentbridge.com",
  "motDePasse": "RegisterPass123!"
}
```

### Refresh
```json
{
  "refresh_token": "REPLACE_WITH_VALID_REFRESH_TOKEN"
}
```

### Logout
```json
{
  "refresh_token": "REPLACE_WITH_VALID_REFRESH_TOKEN"
}
```

### Forgot password
```json
{
  "email": "register.user@talentbridge.com"
}
```

### Reset password with token
```json
{
  "token": "REPLACE_WITH_RESET_TOKEN",
  "nouveauMotDePasse": "NewPass123!"
}
```

### Resend verification email
```json
{
  "email": "register.user@talentbridge.com"
}
```

### Verify email
```json
{
  "token": "REPLACE_WITH_VERIFY_EMAIL_TOKEN"
}
```

### Update my profile
```json
{
  "nom": "My",
  "prenom": "Profile",
  "email": "my.profile@talentbridge.com"
}
```

### Update user (admin)
```json
{
  "nom": "User Updated",
  "prenom": "Profile",
  "email": "updated.user@talentbridge.com",
  "role": "entreprise"
}
```

---

## 9) Reponses utiles

### Login success
```json
{
  "access_token": "<jwt_access_token>",
  "refresh_token": "<jwt_refresh_token>"
}
```

### Register success
```json
{
  "message": "Utilisateur cree avec succes",
  "user": "register.user@talentbridge.com",
  "role": "etudiant",
  "email_verifie": false
}
```

### Verify email success
```json
{
  "message": "Email verifie avec succes"
}
```

---

## 10) Lancement

### Local
```bash
cd Dev/Microservices/Auth-User-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Docker
```bash
cd Dev
docker compose up --build -d
```

Swagger:
- `http://localhost:8000/docs`

---

## 11) Tests

```bash
cd Dev/Microservices/Auth-User-service
pytest -q tests
```

Etat local vise:
- `50 passed`

---

## 12) Base Frontend securite elevee (a appliquer)

### Storage tokens
- `access_token` en memoire (React state / context)
- `refresh_token` en cookie HttpOnly Secure SameSite=Strict (recommande production)
- si cookie HttpOnly non dispo temporairement, fallback localStorage mais moins sur

### HTTP client
- un client Axios centralise
- ajout auto `Authorization: Bearer <access_token>`
- interceptor 401 -> appelle `/api/auth/refresh` -> retry request
- lock de refresh pour eviter appels paralleles multiples

### Route guards
- `guest-only`: login/register/forgot/reset/verify
- `auth-required`: profile
- `admin-required`: gestion utilisateurs

### CSRF / CORS
- limiter `allow_origins` sur domaines frontend connus en production
- si cookie auth, ajouter protection CSRF

### Mot de passe et compte
- validation front + validation backend
- ne jamais exposer stack traces techniques a l'utilisateur
- afficher messages metier simples et coherents

---

## 13) Mapping routes backend -> pages frontend

- `POST /api/auth/register` -> page `Register`
- `POST /api/auth/login` -> page `Login`
- `POST /api/auth/refresh` -> axios interceptor
- `POST /api/auth/logout` -> bouton logout
- `POST /api/auth/forgot-password` -> page `ForgotPassword`
- `POST /api/auth/reset-password-with-token` -> page `ResetPassword` (token URL)
- `POST /api/auth/resend-verification-email` -> page `EmailVerificationPending`
- `POST /api/auth/verify-email` -> page `VerifyEmail` (token URL)
- `GET /api/utilisateurs/profile` -> page `MonProfil`
- `PUT /api/utilisateurs/profile` -> page `MonProfil` submit update
- `GET /api/utilisateurs/` -> page admin `UsersList`
- `GET /api/utilisateurs/supprimes` -> page admin `DeletedUsers`
- `PUT /api/utilisateurs/{id}` -> page admin `EditUser`
- `DELETE /api/utilisateurs/{id}` -> action admin `SoftDelete`
- `PATCH /api/utilisateurs/{id}/restore` -> action admin `Restore`

---

## 14) Design emails

Deux emails transactionnels HTML ont ete mis en place:
- email verification
- email reset password

Ils incluent:
- header brand TalentBridge
- CTA button principal
- fallback link texte
- version texte plain pour compatibilite clients email
- logo configurable via `PLATFORM_LOGO_URL` (sinon derive depuis l'URL frontend)

Le style reste inline pour une meilleure compatibilite Gmail/Outlook.
