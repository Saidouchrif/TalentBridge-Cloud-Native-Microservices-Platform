from dependencies.AuthDependencies import create_email_verification_token, create_password_reset_token


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


def test_register_invalid_email_returns_422(client):
    payload = {
        "nom": "Bad",
        "prenom": "Email",
        "email": "not-an-email",
        "motDePasse": "RegisterPass123!",
        "role": "etudiant",
    }

    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422


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


def test_login_invalid_password_returns_401(client, etudiant_user):
    payload = {
        "email": etudiant_user.email,
        "motDePasse": "WrongPass123!",
    }

    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401


def test_login_requires_verified_email_when_flag_enabled(client, etudiant_user, monkeypatch):
    monkeypatch.setenv("REQUIRE_EMAIL_VERIFICATION_ON_LOGIN", "true")
    response = client.post(
        "/api/auth/login",
        json={"email": etudiant_user.email, "motDePasse": "EtudiantPass123!"},
    )
    assert response.status_code == 403


def test_refresh_success(client, etudiant_refresh_token):
    response = client.post("/api/auth/refresh", json={"refresh_token": etudiant_refresh_token})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_refresh_invalid_token_returns_401(client):
    response = client.post("/api/auth/refresh", json={"refresh_token": "invalid.token.value"})
    assert response.status_code == 401


def test_logout_revokes_access_token(client, etudiant_auth_header, etudiant_refresh_token):
    logout_response = client.post(
        "/api/auth/logout",
        headers=etudiant_auth_header,
        json={"refresh_token": etudiant_refresh_token},
    )
    assert logout_response.status_code == 200

    profile_response = client.get("/api/utilisateurs/profile", headers=etudiant_auth_header)
    assert profile_response.status_code == 401


def test_logout_with_mismatched_refresh_token_returns_403(client, admin_auth_header, etudiant_refresh_token):
    response = client.post(
        "/api/auth/logout",
        headers=admin_auth_header,
        json={"refresh_token": etudiant_refresh_token},
    )
    assert response.status_code == 403


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


def test_reset_password_user_not_found_returns_404(client):
    payload = {
        "email": "unknown.user@talentbridge.com",
        "nouveauMotDePasse": "NewStrongPass123!",
    }

    response = client.post("/api/auth/reset-password", json=payload)
    assert response.status_code == 404


def test_forgot_password_success(client, etudiant_user, monkeypatch):
    # On mock l'envoi email pour eviter une dependance SMTP dans les tests.
    monkeypatch.setattr(
        "Controller.AuthController._envoyer_email_reset_mot_de_passe",
        lambda destinataire, reset_link: None,
    )

    response = client.post("/api/auth/forgot-password", json={"email": etudiant_user.email})
    assert response.status_code == 200
    assert "lien de reinitialisation" in response.json()["message"].lower()


def test_forgot_password_unknown_email_returns_generic_message(client):
    response = client.post("/api/auth/forgot-password", json={"email": "unknown.user@talentbridge.com"})
    assert response.status_code == 200
    assert "lien de reinitialisation" in response.json()["message"].lower()


def test_forgot_password_smtp_not_configured_returns_503(client, etudiant_user, monkeypatch):
    monkeypatch.delenv("SMTP_HOST", raising=False)
    monkeypatch.delenv("SMTP_FROM", raising=False)

    response = client.post("/api/auth/forgot-password", json={"email": etudiant_user.email})
    assert response.status_code == 503


def test_resend_verification_email_success(client, etudiant_user, monkeypatch):
    monkeypatch.setattr(
        "Controller.AuthController._envoyer_email_verification",
        lambda destinataire, verification_link: None,
    )

    response = client.post("/api/auth/resend-verification-email", json={"email": etudiant_user.email})
    assert response.status_code == 200
    assert "verification" in response.json()["message"].lower()


def test_resend_verification_unknown_email_returns_generic_message(client):
    response = client.post("/api/auth/resend-verification-email", json={"email": "unknown.user@talentbridge.com"})
    assert response.status_code == 200


def test_verify_email_with_token_success(client, etudiant_user):
    token = create_email_verification_token(user_id=etudiant_user.id, role=etudiant_user.role)
    response = client.post("/api/auth/verify-email", json={"token": token})
    assert response.status_code == 200
    assert "verifie" in response.json()["message"].lower()


def test_verify_email_with_token_invalid_token_returns_401(client):
    response = client.post("/api/auth/verify-email", json={"token": "invalid.token.value"})
    assert response.status_code == 401


def test_verify_email_with_token_cannot_be_reused(client, etudiant_user):
    token = create_email_verification_token(user_id=etudiant_user.id, role=etudiant_user.role)
    first_response = client.post("/api/auth/verify-email", json={"token": token})
    assert first_response.status_code == 200

    second_response = client.post("/api/auth/verify-email", json={"token": token})
    assert second_response.status_code == 401


def test_reset_password_with_token_success(client, etudiant_user):
    token = create_password_reset_token(user_id=etudiant_user.id, role=etudiant_user.role)

    response = client.post(
        "/api/auth/reset-password-with-token",
        json={
            "token": token,
            "nouveauMotDePasse": "NouveauMotDePasse123!",
        },
    )
    assert response.status_code == 200

    login_response = client.post(
        "/api/auth/login",
        json={"email": etudiant_user.email, "motDePasse": "NouveauMotDePasse123!"},
    )
    assert login_response.status_code == 200


def test_reset_password_with_token_invalid_token_returns_401(client):
    response = client.post(
        "/api/auth/reset-password-with-token",
        json={
            "token": "invalid.token.value",
            "nouveauMotDePasse": "NouveauMotDePasse123!",
        },
    )
    assert response.status_code == 401


def test_reset_password_with_token_cannot_be_reused(client, etudiant_user):
    token = create_password_reset_token(user_id=etudiant_user.id, role=etudiant_user.role)

    first_response = client.post(
        "/api/auth/reset-password-with-token",
        json={
            "token": token,
            "nouveauMotDePasse": "NouveauMotDePasse123!",
        },
    )
    assert first_response.status_code == 200

    second_response = client.post(
        "/api/auth/reset-password-with-token",
        json={
            "token": token,
            "nouveauMotDePasse": "EncoreUnPass123!",
        },
    )
    assert second_response.status_code == 401
