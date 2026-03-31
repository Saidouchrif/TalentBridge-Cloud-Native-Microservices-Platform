from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from config.database import get_db
from Controller.AuthController import (
    create_user_by_developer,
    login_user,
    logout_user,
    refresh_user_session,
    register_user,
    reset_password,
)
from Model.User import User
from Schemas.AuthSchema import (
    CreateUserByDeveloperSchema,
    LoginSchema,
    LogoutSchema,
    RefreshSchema,
    RegisterSchema,
    ResetPasswordSchema,
)
from dependencies.AuthDependencies import (
    admin_required,
    get_current_user,
    security,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    utilisateur = register_user(db, data)
    return {
        "message": "Utilisateur cree avec succes",
        "user": utilisateur.email,
        "role": utilisateur.role,
    }


@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    return login_user(db, data)


@router.post("/refresh")
def refresh(data: RefreshSchema, db: Session = Depends(get_db)):
    return refresh_user_session(db, data.refresh_token)


@router.post("/logout")
def logout(
    data: LogoutSchema | None = None,
    token: HTTPAuthorizationCredentials = Depends(security),
    current_user: User = Depends(get_current_user),
):
    refresh_token = data.refresh_token if data else None
    return logout_user(
        access_token=token.credentials,
        current_user=current_user,
        refresh_token=refresh_token,
    )


@router.post("/create-user")
def create_user(
    data: CreateUserByDeveloperSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    utilisateur = create_user_by_developer(db, data, current_user)
    return {
        "message": "Utilisateur cree par admin",
        "user_id": utilisateur.id,
        "email": utilisateur.email,
        "role": utilisateur.role,
    }


@router.post("/reset-password")
def reset_password_route(data: ResetPasswordSchema, db: Session = Depends(get_db)):
    return reset_password(db, data)
