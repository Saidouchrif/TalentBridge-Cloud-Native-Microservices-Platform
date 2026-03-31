from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class UpdateUserSchema(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[Literal["admin", "entreprise", "etudiant"]] = None


class UserResponseSchema(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr
    role: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UpdateMyProfileSchema(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
