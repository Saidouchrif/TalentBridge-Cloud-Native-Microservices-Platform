from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from config.database import Base


class User(Base):
    # Table des utilisateurs pour le microservice Auth/User.
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(120), nullable=False)
    prenom = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)

    # Le champ motDePasse stocke le hash du mot de passe (jamais en clair).
    motDePasse = Column(String(255), nullable=False)

    # Roles metier TalentBridge: admin, entreprise, etudiant.
    role = Column(String(50), nullable=False, default="etudiant")

    # Dates de suivi.
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Soft delete: si non null, le compte est considere comme supprime.
    deleted_at = Column(DateTime, nullable=True, default=None)
