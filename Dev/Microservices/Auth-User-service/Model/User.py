from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum as SQLEnum, Integer, String

from config.database import Base


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(120), nullable=False)
    prenom = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    motDePasse = Column(String(255), nullable=False)
    role = Column(
        SQLEnum(
            "admin",
            "entreprise",
            "etudiant",
            name="user_role",
            native_enum=False,
        ),
        nullable=False,
        default="etudiant",
    )
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utc_now, onupdate=_utc_now)
    deleted_at = Column(DateTime(timezone=True), nullable=True, default=None)
    email_verifie = Column(Boolean, nullable=False, default=False)
    email_verifie_at = Column(DateTime(timezone=True), nullable=True, default=None)
