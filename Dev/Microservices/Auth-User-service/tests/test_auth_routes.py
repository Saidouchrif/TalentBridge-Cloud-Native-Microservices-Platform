def test_register_success(client):
    payload = {
        "nom": "Register",
        "prenom": "User",
        "email": "register.user@talentbridge.com",
        "motDePasse": "RegisterPass123!",
        "role": "etudiant",
    }

    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "Utilisateur cree avec succes"
    assert body["user"] == "register.user@talentbridge.com"


def test_register_duplicate_email(client, etudiant_user):
    payload = {
        "nom": "Dup",
        "prenom": "User",
        "email": etudiant_user.email,
        "motDePasse": "RegisterPass123!",
        "role": "etudiant",
    }

    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400


def test_register_with_deleted_email_returns_409(client, deleted_user):
    payload = {
        "nom": "Dup",
        "prenom": "Deleted",
        "email": deleted_user.email,
        "motDePasse": "RegisterPass123!",
        "role": "etudiant",
    }

    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409


def test_login_success(client, etudiant_user):
    payload = {
        "email": etudiant_user.email,
        "motDePasse": "EtudiantPass123!",
    }

    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body


def test_login_deleted_user_forbidden(client, deleted_user):
    payload = {
        "email": deleted_user.email,
        "motDePasse": "DeletedPass123!",
    }

    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 403


def test_refresh_success(client, etudiant_refresh_token):
    response = client.post("/api/auth/refresh", json={"refresh_token": etudiant_refresh_token})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_logout_revokes_access_token(client, etudiant_auth_header, etudiant_refresh_token):
    logout_response = client.post(
        "/api/auth/logout",
        headers=etudiant_auth_header,
        json={"refresh_token": etudiant_refresh_token},
    )
    assert logout_response.status_code == 200

    profile_response = client.get("/api/utilisateurs/profile", headers=etudiant_auth_header)
    assert profile_response.status_code == 401


def test_create_user_admin_success(client, admin_auth_header):
    payload = {
        "nom": "Created",
        "prenom": "ByAdmin",
        "email": "created.by.admin@talentbridge.com",
        "motDePasse": "CreatePass123!",
        "role": "entreprise",
    }

    response = client.post("/api/auth/create-user", headers=admin_auth_header, json=payload)
    assert response.status_code == 200
    assert response.json()["role"] == "entreprise"


def test_create_user_non_admin_forbidden(client, etudiant_auth_header):
    payload = {
        "nom": "Blocked",
        "prenom": "User",
        "email": "blocked.user@talentbridge.com",
        "motDePasse": "CreatePass123!",
        "role": "etudiant",
    }

    response = client.post("/api/auth/create-user", headers=etudiant_auth_header, json=payload)
    assert response.status_code == 403


def test_reset_password_success(client, etudiant_user):
    payload = {
        "email": etudiant_user.email,
        "nouveauMotDePasse": "NewStrongPass123!",
    }

    reset_response = client.post("/api/auth/reset-password", json=payload)
    assert reset_response.status_code == 200

    login_response = client.post(
        "/api/auth/login",
        json={"email": etudiant_user.email, "motDePasse": "NewStrongPass123!"},
    )
    assert login_response.status_code == 200
