from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from Controller.AuthController import register_user
from Controller.UserController import delete_user, restore_user


def test_service_register_normalise_email(db_session):
    data = SimpleNamespace(
        nom="Service",
        prenom="Test",
        email="SERVICE.TEST@TALENTBRIDGE.COM ",
        motDePasse="StrongPass123!",
        role="etudiant",
    )

    user = register_user(db_session, data)
    assert user.email == "service.test@talentbridge.com"


def test_service_register_deleted_email_conflict(db_session, deleted_user):
    data = SimpleNamespace(
        nom="Dup",
        prenom="Deleted",
        email=deleted_user.email,
        motDePasse="StrongPass123!",
        role="etudiant",
    )

    with pytest.raises(HTTPException) as exc_info:
        register_user(db_session, data)

    assert exc_info.value.status_code == 409


def test_service_soft_delete_and_restore(db_session, admin_user, etudiant_user):
    delete_result = delete_user(db_session, etudiant_user.id, admin_user)
    assert "soft delete" in delete_result["message"]

    restored_user = restore_user(db_session, etudiant_user.id, admin_user)
    assert restored_user.deleted_at is None
