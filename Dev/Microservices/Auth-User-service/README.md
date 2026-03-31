# Auth-User Service - TalentBridge

## 1) Objectif du service

Ce microservice est la base d'authentification et gestion utilisateurs pour TalentBridge.
Il est pret pour etre connecte ensuite avec le Frontend et les autres microservices.

Fonctionnalites principales:
- Inscription et connexion JWT
- Refresh token et logout (revocation)
- Gestion utilisateurs (profil, update, liste, soft delete, restore)
- Gestion des roles: `admin`, `entreprise`, `etudiant`
- Mot de passe oublie par email avec token de reset (usage unique)

---

## 2) Stack technique

- FastAPI
- SQLAlchemy
- PostgreSQL
- passlib + bcrypt
- python-jose (JWT)
- Pydantic
- Pytest

---

## 3) Architecture du service

```text
Auth-User-service/
+- config/
¦  +- database.py
+- Controller/
¦  +- AuthController.py
¦  +- UserController.py
+- dependencies/
¦  +- AuthDependencies.py
+- Model/
¦  +- User.py
+- Routes/
¦  +- AuthRoute.py
¦  +- UserRoutes.py
¦  +- index.py
+- Schemas/
¦  +- AuthSchema.py
¦  +- UserSchema.py
+- tests/
¦  +- conftest.py
¦  +- test_system_routes.py
¦  +- test_auth_routes.py
¦  +- test_user_routes.py
¦  +- test_service_controllers.py
+- main.py
+- requirements.txt
+- .env
```

---

## 4) Modele metier User

Fichier: `Model/User.py`

- `id: int`
- `nom: string`
- `prenom: string`
- `email: string` (unique)
- `motDePasse: string` (hash)
- `role: enum` (`admin`, `entreprise`, `etudiant`)
- `created_at: datetime`
- `updated_at: datetime`
- `deleted_at: datetime | null` (soft delete)

Table SQL: `utilisateurs`

---

## 5) Variables d'environnement (.env)

```env
DATABASE_URL=postgresql://talentbridge_user:talentbridge_password@postgres_db:5432/user_db
SECRET_KEY=super_secret_key_123456
REFRESH_SECRET_KEY=super_refresh_secret_key_123456
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
REFRESH_TOKEN_EXPIRE_DAYS=7
RESET_TOKEN_EXPIRE_MINUTES=30
RESET_PASSWORD_URL=http://localhost:5173/reset-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=TalentBridge <noreply@talentbridge.com>
SMTP_USE_TLS=true
SMTP_USE_SSL=false
ENV=docker
```

Important:
- `DATABASE_URL` doit correspondre au `docker-compose.yaml`.
- `REFRESH_SECRET_KEY` est obligatoire pour `/refresh`.

---

## 6) Securite appliquee

- Hash du mot de passe avec `bcrypt`
- JWT access/refresh
- Payload JWT metier: `user_id`, `role`
- Revocation token au logout
- Validation email metier (format + normalisation)
- Mot de passe oublie par token JWT scope `reset_password`
- Token reset a usage unique
- Soft-deleted user bloque en auth

---

## 7) Regles metier

1. Suppression utilisateur = soft delete (`deleted_at` rempli)
2. Un email deja utilise par un compte supprime reste reserve
3. Reinscription avec email d'un compte supprime => `409`
4. Seul `admin` peut:
   - lister tous les users
   - lister users supprimes
   - restaurer un user
   - creer un user via route admin

---

## 8) Routes API completes

Base API: `/api`

### 8.1 System
- `GET /`
- `GET /health`

### 8.2 Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/create-user` (admin)
- `POST /api/auth/reset-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password-with-token`

### 8.3 Utilisateurs
- `GET /api/utilisateurs/profile`
- `PUT /api/utilisateurs/profile`
- `GET /api/utilisateurs/` (admin)
- `GET /api/utilisateurs/supprimes` (admin)
- `GET /api/utilisateurs/{user_id}` (admin)
- `PUT /api/utilisateurs/{user_id}` (admin)
- `DELETE /api/utilisateurs/{user_id}` (admin)
- `PATCH /api/utilisateurs/{user_id}/restore` (admin)

---

## 9) JSON de test (pret pour Postman/Frontend)

### register
```json
{
  "nom": "Register",
  "prenom": "User",
  "email": "register.user@talentbridge.com",
  "motDePasse": "RegisterPass123!",
  "role": "etudiant"
}
```

### login
```json
{
  "email": "register.user@talentbridge.com",
  "motDePasse": "RegisterPass123!"
}
```

### refresh
```json
{
  "refresh_token": "REPLACE_WITH_VALID_REFRESH_TOKEN"
}
```

### logout
```json
{
  "refresh_token": "REPLACE_WITH_VALID_REFRESH_TOKEN"
}
```

### create-user (admin)
```json
{
  "nom": "Created",
  "prenom": "ByAdmin",
  "email": "created.user@talentbridge.com",
  "motDePasse": "CreatePass123!",
  "role": "entreprise"
}
```

### reset-password
```json
{
  "email": "register.user@talentbridge.com",
  "nouveauMotDePasse": "NewEmployeePass456!"
}
```

### forgot-password
```json
{
  "email": "register.user@talentbridge.com"
}
```

### reset-password-with-token
```json
{
  "token": "REPLACE_WITH_RESET_TOKEN",
  "nouveauMotDePasse": "NewEmployeePass456!"
}
```

### update profile
```json
{
  "nom": "My",
  "prenom": "Profile",
  "email": "my.profile@talentbridge.com"
}
```

### update user (admin)
```json
{
  "nom": "User Updated",
  "prenom": "Profile",
  "email": "updated.user@talentbridge.com",
  "role": "etudiant"
}
```

---

## 10) Reponses API utiles

### Login success
```json
{
  "access_token": "<jwt_access_token>",
  "refresh_token": "<jwt_refresh_token>"
}
```

### Logout success
```json
{
  "message": "Deconnexion effectuee avec succes"
}
```

### Soft delete success
```json
{
  "message": "Utilisateur supprime avec succes (soft delete)"
}
```

### Conflit email compte supprime
```json
{
  "detail": "Un compte supprime existe deja avec cet email. Demandez a un admin de restaurer ce compte."
}
```

---

## 11) Lancement du service

### Local
```bash
cd Dev/Microservices/Auth-User-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Docker (projet Dev)
```bash
cd Dev
docker compose up --build -d
```

Swagger:
- `http://localhost:8000/docs`

---

## 12) Notes Docker importantes

- Le service PostgreSQL utilise un volume dedie:
  - `talentbridge_pgdata`
- Le Front utilise:
  - `frontend_node_modules`
- Eviter mismatch credentials entre `.env` et `docker-compose.yaml`.

---

## 13) Tests

Commande:
```bash
cd Dev/Microservices/Auth-User-service
pytest -q
```

Etat actuel:
- `44 passed`

Couverture testee:
- Routes systeme
- Routes auth (success + erreurs)
- Routes users (success + erreurs)
- Services/controllers
- Codes d'erreur verifies: `401`, `403`, `404`, `409`, `422`, `503`

---

## 14) Base pour integration Frontend

Pour le frontend, utiliser ce flux:
1. `register` ou `login`
2. Stocker `access_token` + `refresh_token`
3. Envoyer `Authorization: Bearer <access_token>` sur routes protegees
4. Si `401`, appeler `/api/auth/refresh` avec refresh token
5. Pour mot de passe oublie:
   - appeler `/api/auth/forgot-password`
   - frontend lit `token` depuis URL (`RESET_PASSWORD_URL`)
   - appeler `/api/auth/reset-password-with-token`

Ce service est maintenant une base stable pour brancher l'UI Frontend.

