from typing import Literal, Optional

from pydantic import BaseModel, EmailStr


class RegisterSchema(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    motDePasse: str

    # Inscription publique limitee aux profils metier standards.
    role: Literal["etudiant", "entreprise"] = "etudiant"


class LoginSchema(BaseModel):
    email: EmailStr
    motDePasse: str


class RefreshSchema(BaseModel):
    refresh_token: str


class CreateUserByDeveloperSchema(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    motDePasse: str
    role: Literal["admin", "entreprise", "etudiant"]


class ResetPasswordSchema(BaseModel):
    email: EmailStr
    nouveauMotDePasse: str


class ForgotPasswordSchema(BaseModel):
    email: EmailStr


class ResetPasswordWithTokenSchema(BaseModel):
    token: str
    nouveauMotDePasse: str


class VerifyEmailSchema(BaseModel):
    token: str


class ResendVerificationEmailSchema(BaseModel):
    email: EmailStr


class LogoutSchema(BaseModel):
    # Optionnel: si fourni, le refresh token sera aussi revoque.
    refresh_token: Optional[str] = None
