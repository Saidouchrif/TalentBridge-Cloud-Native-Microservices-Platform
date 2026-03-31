import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Base path stable pour eviter les collisions entre dossiers Code/Dev.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
TEST_DB_FILE = Path(__file__).resolve().parent / "test_auth_service.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_FILE.as_posix()}"

# Variables de test avant imports applicatifs.
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["SECRET_KEY"] = "test_secret_key_for_pytest"
os.environ["REFRESH_SECRET_KEY"] = "test_refresh_secret_key_for_pytest"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_HOURS"] = "1"
os.environ["REFRESH_TOKEN_EXPIRE_DAYS"] = "7"
os.environ["RESET_TOKEN_EXPIRE_MINUTES"] = "30"
os.environ["VERIFY_EMAIL_TOKEN_EXPIRE_MINUTES"] = "60"
os.environ["RESET_PASSWORD_URL"] = "http://localhost:5173/reset-password"
os.environ["EMAIL_VERIFICATION_URL"] = "http://localhost:5173/verify-email"

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from config.database import Base, get_db  # noqa: E402
import dependencies.AuthDependencies as auth_dependencies  # noqa: E402
from dependencies.AuthDependencies import create_access_token, create_refresh_token, hash_password  # noqa: E402
from main import app  # noqa: E402
from Model.User import User  # noqa: E402

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def reset_security_state():
    # Nettoie l'etat memoire des tokens entre tests pour eviter les effets de bord.
    auth_dependencies._revoked_access_tokens.clear()
    auth_dependencies._revoked_refresh_tokens.clear()
    auth_dependencies._used_password_reset_tokens.clear()
    auth_dependencies._used_email_verification_tokens.clear()
    yield
    auth_dependencies._revoked_access_tokens.clear()
    auth_dependencies._revoked_refresh_tokens.clear()
    auth_dependencies._used_password_reset_tokens.clear()
    auth_dependencies._used_email_verification_tokens.clear()


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def _get_test_db():
        yield db_session

    app.dependency_overrides[get_db] = _get_test_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_user(db_session):
    user = User(
        nom="Admin",
        prenom="System",
        email="admin@talentbridge.com",
        motDePasse=hash_password("AdminPass123!"),
        role="admin",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def etudiant_user(db_session):
    user = User(
        nom="Etudiant",
        prenom="User",
        email="etudiant@talentbridge.com",
        motDePasse=hash_password("EtudiantPass123!"),
        role="etudiant",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def entreprise_user(db_session):
    user = User(
        nom="Entreprise",
        prenom="User",
        email="entreprise@talentbridge.com",
        motDePasse=hash_password("EntreprisePass123!"),
        role="entreprise",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def deleted_user(db_session):
    user = User(
        nom="Deleted",
        prenom="User",
        email="deleted@talentbridge.com",
        motDePasse=hash_password("DeletedPass123!"),
        role="etudiant",
        deleted_at=datetime.now(timezone.utc),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def admin_token(admin_user):
    return create_access_token(user_id=admin_user.id, role=admin_user.role)


@pytest.fixture(scope="function")
def etudiant_token(etudiant_user):
    return create_access_token(user_id=etudiant_user.id, role=etudiant_user.role)


@pytest.fixture(scope="function")
def entreprise_token(entreprise_user):
    return create_access_token(user_id=entreprise_user.id, role=entreprise_user.role)


@pytest.fixture(scope="function")
def etudiant_refresh_token(etudiant_user):
    return create_refresh_token(user_id=etudiant_user.id, role=etudiant_user.role)


@pytest.fixture(scope="function")
def admin_auth_header(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="function")
def etudiant_auth_header(etudiant_token):
    return {"Authorization": f"Bearer {etudiant_token}"}


@pytest.fixture(scope="function")
def entreprise_auth_header(entreprise_token):
    return {"Authorization": f"Bearer {entreprise_token}"}
