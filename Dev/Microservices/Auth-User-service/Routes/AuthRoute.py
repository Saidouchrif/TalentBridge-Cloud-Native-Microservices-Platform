from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from config.database import get_db
from Controller.AuthController import (
    create_user_by_developer,
    forgot_password,
    login_user,
    logout_user,
    resend_verification_email,
    refresh_user_session,
    register_user,
    reset_password,
    reset_password_with_token,
    verify_email_with_token,
)
from Model.User import User
from Schemas.AuthSchema import (
    CreateUserByDeveloperSchema,
    ForgotPasswordSchema,
    LoginSchema,
    LogoutSchema,
    RefreshSchema,
    RegisterSchema,
    ResendVerificationEmailSchema,
    ResetPasswordSchema,
    ResetPasswordWithTokenSchema,
    VerifyEmailSchema,
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
        "email_verifie": utilisateur.email_verifie,
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


@router.post("/forgot-password")
def forgot_password_route(data: ForgotPasswordSchema, db: Session = Depends(get_db)):
    return forgot_password(db, data)


@router.post("/resend-verification-email")
def resend_verification_email_route(data: ResendVerificationEmailSchema, db: Session = Depends(get_db)):
    return resend_verification_email(db, data)


@router.post("/verify-email")
def verify_email_route(data: VerifyEmailSchema, db: Session = Depends(get_db)):
    return verify_email_with_token(db, data)


@router.post("/reset-password-with-token")
def reset_password_with_token_route(data: ResetPasswordWithTokenSchema, db: Session = Depends(get_db)):
    return reset_password_with_token(db, data)
