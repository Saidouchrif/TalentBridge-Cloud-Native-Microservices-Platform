def test_get_profile_success(client, etudiant_auth_header):
    response = client.get("/api/utilisateurs/profile", headers=etudiant_auth_header)
    assert response.status_code == 200
    assert response.json()["role"] == "etudiant"


def test_update_profile_success(client, etudiant_auth_header):
    payload = {
        "nom": "Etudiant Updated",
        "prenom": "User Updated",
        "email": "etudiant.updated@talentbridge.com",
    }

    response = client.put("/api/utilisateurs/profile", headers=etudiant_auth_header, json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["nom"] == "Etudiant Updated"
    assert body["email"] == "etudiant.updated@talentbridge.com"


def test_list_users_admin_success(client, admin_auth_header, etudiant_user, entreprise_user):
    response = client.get("/api/utilisateurs/", headers=admin_auth_header)
    assert response.status_code == 200
    assert len(response.json()) >= 3


def test_list_users_non_admin_forbidden(client, etudiant_auth_header):
    response = client.get("/api/utilisateurs/", headers=etudiant_auth_header)
    assert response.status_code == 403


def test_get_user_by_id_admin_success(client, admin_auth_header, etudiant_user):
    response = client.get(f"/api/utilisateurs/{etudiant_user.id}", headers=admin_auth_header)
    assert response.status_code == 200
    assert response.json()["id"] == etudiant_user.id


def test_update_user_admin_success(client, admin_auth_header, etudiant_user):
    payload = {
        "nom": "Admin Updated",
        "prenom": "Target",
        "email": "admin.updated.target@talentbridge.com",
        "role": "entreprise",
    }

    response = client.put(
        f"/api/utilisateurs/{etudiant_user.id}",
        headers=admin_auth_header,
        json=payload,
    )
    assert response.status_code == 200
    assert response.json()["role"] == "entreprise"


def test_soft_delete_and_restore_user(client, admin_auth_header, etudiant_user):
    delete_response = client.delete(
        f"/api/utilisateurs/{etudiant_user.id}",
        headers=admin_auth_header,
    )
    assert delete_response.status_code == 200

    deleted_list_response = client.get("/api/utilisateurs/supprimes", headers=admin_auth_header)
    assert deleted_list_response.status_code == 200
    deleted_ids = [u["id"] for u in deleted_list_response.json()]
    assert etudiant_user.id in deleted_ids

    restore_response = client.patch(
        f"/api/utilisateurs/{etudiant_user.id}/restore",
        headers=admin_auth_header,
    )
    assert restore_response.status_code == 200
    assert restore_response.json()["deleted_at"] is None


def test_update_user_with_deleted_email_returns_409(client, admin_auth_header, etudiant_user, deleted_user):
    payload = {"email": deleted_user.email}
    response = client.put(
        f"/api/utilisateurs/{etudiant_user.id}",
        headers=admin_auth_header,
        json=payload,
    )
    assert response.status_code == 409
