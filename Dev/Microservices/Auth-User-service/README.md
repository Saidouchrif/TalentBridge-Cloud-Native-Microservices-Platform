# Auth-User Service - TalentBridge

## 1) Presentation

Ce microservice gere:
- authentification JWT (login / refresh / logout)
- gestion des utilisateurs
- gestion des roles metier: `admin`, `entreprise`, `etudiant`
- securisation des routes via Bearer Token
- soft delete + restauration des comptes

Stack:
- FastAPI
- SQLAlchemy
- PostgreSQL
- passlib/bcrypt
- python-jose (JWT)
- Pydantic
- Pytest + GitHub Actions

---

## 2) Modele User (etat actuel du code)

Fichier: `Model/User.py`

Champs:
- `id: int`
- `nom: string`
- `prenom: string`
- `email: string`
- `motDePasse: string` (hash bcrypt)
- `role: enum` (`admin`, `entreprise`, `etudiant`) avec default `etudiant`
- `created_at: datetime`
- `updated_at: datetime`
- `deleted_at: datetime | null` (soft delete)

---

## 3) Variables d'environnement

```env
DATABASE_URL=postgresql://talentbridge_user:talentbridge_password@postgres_db:5432/user_db
SECRET_KEY=super_secret_key_123456
REFRESH_SECRET_KEY=super_refresh_secret_key_123456
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
REFRESH_TOKEN_EXPIRE_DAYS=7
RESET_TOKEN_EXPIRE_MINUTES=30
RESET_PASSWORD_URL=http://localhost:3000/reset-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=TalentBridge <noreply@talentbridge.com>
SMTP_USE_TLS=true
SMTP_USE_SSL=false
ENV=docker
```

---

## 4) Securite

- Mot de passe hashe avec bcrypt (`passlib`)
- JWT payload metier: `user_id`, `role` (+ `exp` standard)
- Invalidation token supportee (logout)
- Utilisateur soft-deleted bloque en auth
- Validation metier email (normalisation + verification format)
- Reset password par token JWT scope `reset_password` (usage unique)

Guards:
- `get_current_user`: utilisateur authentifie non supprime
- `admin_required`: acces admin

---

## 5) Regles metier importantes

1. Soft delete sur suppression user (`deleted_at` rempli)
2. Un compte soft-deleted garde son email reserve
3. Si on tente de recreer meme email d'un compte supprime:
   - HTTP `409`
   - message demandant une restauration admin
4. Admin peut:
   - lister comptes actifs
   - lister comptes supprimes
   - restaurer un compte supprime

---

## 6) Liste complete des routes (etat actuel)

Base API: `/api`

## 6.1 Systeme
- `GET /`
- `GET /health`

## 6.2 Auth
- `POST /api/auth/register` (public)
- `POST /api/auth/login` (public)
- `POST /api/auth/refresh` (public)
- `POST /api/auth/logout` (authentifie)
- `POST /api/auth/create-user` (admin)
- `POST /api/auth/reset-password` (public)
- `POST /api/auth/forgot-password` (public, envoi email reset)
- `POST /api/auth/reset-password-with-token` (public)

## 6.3 Utilisateurs
- `GET /api/utilisateurs/profile` (authentifie)
- `PUT /api/utilisateurs/profile` (authentifie)
- `GET /api/utilisateurs/` (admin, actifs)
- `GET /api/utilisateurs/supprimes` (admin, supprimes)
- `GET /api/utilisateurs/{user_id}` (admin)
- `PUT /api/utilisateurs/{user_id}` (admin)
- `DELETE /api/utilisateurs/{user_id}` (admin, soft delete)
- `PATCH /api/utilisateurs/{user_id}/restore` (admin)

---

## 7) JSON de test recommandes (API actuelle)

### 7.1 register.json
```json
{
  "nom": "Register",
  "prenom": "User",
  "email": "register.user@talentbridge.com",
  "motDePasse": "RegisterPass123!",
  "role": "etudiant"
}
```

### 7.2 login.json
```json
{
  "email": "register.user@talentbridge.com",
  "motDePasse": "RegisterPass123!"
}
```

### 7.3 refresh.json
```json
{
  "refresh_token": "REPLACE_WITH_VALID_REFRESH_TOKEN"
}
```

### 7.4 logout.json
```json
{
  "refresh_token": "REPLACE_WITH_VALID_REFRESH_TOKEN"
}
```

### 7.5 create_user.json
```json
{
  "nom": "Created",
  "prenom": "ByAdmin",
  "email": "created.user@talentbridge.com",
  "motDePasse": "CreatePass123!",
  "role": "entreprise"
}
```

### 7.6 reset_password.json
```json
{
  "email": "register.user@talentbridge.com",
  "nouveauMotDePasse": "NewEmployeePass456!"
}
```

### 7.7 forgot_password.json
```json
{
  "email": "register.user@talentbridge.com"
}
```

### 7.8 reset_password_with_token.json
```json
{
  "token": "REPLACE_WITH_RESET_TOKEN",
  "nouveauMotDePasse": "NewEmployeePass456!"
}
```

### 7.9 update_user.json
```json
{
  "nom": "User Updated",
  "prenom": "Profile",
  "email": "updated.user@talentbridge.com",
  "role": "etudiant"
}
```

### 7.10 update_profile.json
```json
{
  "nom": "My",
  "prenom": "Profile",
  "email": "my.profile@talentbridge.com"
}
```

---

## 8) Exemples de reponses

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

### Restore success
```json
{
  "id": 5,
  "nom": "Alae",
  "prenom": "Nour",
  "email": "alae.nour@talentbridge.com",
  "role": "etudiant",
  "created_at": "2026-03-31T10:15:30.123456",
  "updated_at": "2026-03-31T11:00:00.000000",
  "deleted_at": null
}
```

### Email conflict with deleted account
```json
{
  "detail": "Un compte supprime existe deja avec cet email. Demandez a un admin de restaurer ce compte."
}
```

---

## 9) Lancement

Local:
```bash
cd Dev/Microservices/Auth-User-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Docker:
```bash
cd Dev
docker compose up --build
```

Swagger:
- `http://localhost:8000/docs`

---

## 10) Compatibilite Python 3.13+ (warnings)

Corrections appliquees:
- `datetime.utcnow()` remplace par `datetime.now(timezone.utc)` dans le service et les tests
- datetimes du modele en mode timezone-aware (`DateTime(timezone=True)`)
- warning tiers `python-multipart` filtre proprement dans `pytest.ini`
- warning tiers `python-jose` (`utcnow` interne a la lib) filtre proprement dans `pytest.ini`
- warning cache pytest desactive via `addopts = -p no:cacheprovider`

Resultat local:
- `44 passed`

---

## 11) Suite de tests implementee

Le dossier `tests/` couvre:
- routes systeme (`/`, `/health`)
- routes auth (`register`, `login`, `refresh`, `logout`, `create-user`, `reset-password`, `forgot-password`, `reset-password-with-token`)
- routes utilisateurs (`profile`, listing admin, soft delete, restore, controles d'acces`)
- logique service/controllers (normalisation email, conflits, soft delete/restore, tokens reset)
- cas d'erreurs API (`401`, `403`, `404`, `409`, `422`, `503`)

Fichiers principaux:
- `tests/test_system_routes.py`
- `tests/test_auth_routes.py`
- `tests/test_user_routes.py`
- `tests/test_service_controllers.py`

Lancer les tests:
```bash
cd Dev/Microservices/Auth-User-service
pytest -q
```

---

## 12) Pipeline GitHub Actions

Workflow:
- `.github/workflows/Auth-user-ci.yaml`

Ce pipeline:
1. installe Python 3.11 et les dependances
2. verifie la syntaxe (`python -m compileall .`)
3. execute `pytest -q --maxfail=1`

---

## 13) Versions conseillees (requirements)

Les dependances sont pinnees dans `requirements.txt` pour stabilite CI/production.
Exemples importants:
- `fastapi==0.115.2`
- `sqlalchemy==2.0.44`
- `python-jose==3.3.0`
- `python-multipart==0.0.20`
- `pytest==8.4.1`

---

## 14) Depannage rapide

### Je ne vois pas la table `utilisateurs` dans PostgreSQL
Verifier:
1. Le model est bien importe avant `Base.metadata.create_all(...)` dans `main.py`:
   - `from Model.User import User`
2. Le `DATABASE_URL` dans `.env` correspond aux credentials de `docker-compose.yaml`.
3. Les conteneurs ont bien redemarre apres changement:
   - `docker compose up -d --build`
