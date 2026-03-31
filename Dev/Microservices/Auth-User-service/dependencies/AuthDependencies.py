from datetime import datetime, timedelta, timezone
import os
from threading import Lock

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config.database import get_db
from Model.User import User

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY")
RESET_PASSWORD_SECRET_KEY = os.getenv("RESET_PASSWORD_SECRET_KEY", SECRET_KEY)
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))
RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "30"))

ROLE_ADMIN = "admin"
ROLE_ENTREPRISE = "entreprise"
ROLE_ETUDIANT = "etudiant"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

_revoked_access_tokens: set[str] = set()
_revoked_refresh_tokens: set[str] = set()
_used_password_reset_tokens: set[str] = set()
_revoke_lock = Lock()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def _build_jwt_payload(user_id: int, role: str, expires_delta: timedelta) -> dict:
    expire = datetime.now(timezone.utc) + expires_delta
    return {"user_id": user_id, "role": role, "exp": expire}


def create_access_token(user_id: int, role: str) -> str:
    payload = _build_jwt_payload(user_id, role, timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: int, role: str) -> str:
    payload = _build_jwt_payload(user_id, role, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    return jwt.encode(payload, REFRESH_SECRET_KEY, algorithm=ALGORITHM)


def create_password_reset_token(user_id: int, role: str) -> str:
    payload = _build_jwt_payload(user_id, role, timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES))
    payload["scope"] = "reset_password"
    return jwt.encode(payload, RESET_PASSWORD_SECRET_KEY, algorithm=ALGORITHM)


def revoke_access_token(token: str) -> None:
    with _revoke_lock:
        _revoked_access_tokens.add(token)


def revoke_refresh_token(token: str) -> None:
    with _revoke_lock:
        _revoked_refresh_tokens.add(token)


def mark_password_reset_token_as_used(token: str) -> None:
    with _revoke_lock:
        _used_password_reset_tokens.add(token)


def _is_access_token_revoked(token: str) -> bool:
    with _revoke_lock:
        return token in _revoked_access_tokens


def _is_refresh_token_revoked(token: str) -> bool:
    with _revoke_lock:
        return token in _revoked_refresh_tokens


def _is_password_reset_token_used(token: str) -> bool:
    with _revoke_lock:
        return token in _used_password_reset_tokens


def decode_access_token(token: str) -> dict:
    if _is_access_token_revoked(token):
        raise HTTPException(status_code=401, detail="Token d'acces revoque")

    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Token d'acces invalide") from exc


def decode_refresh_token(token: str) -> dict:
    if _is_refresh_token_revoked(token):
        raise HTTPException(status_code=401, detail="Refresh token revoque")

    try:
        return jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Refresh token invalide") from exc


def decode_password_reset_token(token: str) -> dict:
    if _is_password_reset_token_used(token):
        raise HTTPException(status_code=401, detail="Token de reinitialisation deja utilise")

    try:
        payload = jwt.decode(token, RESET_PASSWORD_SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Token de reinitialisation invalide") from exc

    if payload.get("scope") != "reset_password":
        raise HTTPException(status_code=401, detail="Portee du token invalide")

    return payload


def get_current_user(token=Depends(security), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token.credentials)
    user_id = payload.get("user_id")
    role = payload.get("role")

    if user_id is None or role is None:
        raise HTTPException(status_code=401, detail="Payload token invalide")

    user = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable ou supprime")

    if user.role != role:
        raise HTTPException(status_code=401, detail="Role du token obsolete")

    return user


def admin_required(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != ROLE_ADMIN:
        raise HTTPException(status_code=403, detail="Acces admin requis")
    return current_user
