from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from Model.User import User


def _recuperer_user_ou_404(db: Session, user_id: int) -> User:
    utilisateur = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return utilisateur


def _recuperer_user_supprime_ou_404(db: Session, user_id: int) -> User:
    utilisateur = db.query(User).filter(User.id == user_id, User.deleted_at.is_not(None)).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur supprime introuvable")
    return utilisateur


def _verifier_email_unique(db: Session, email: str, user_id_courant: int | None = None) -> None:
    query = db.query(User).filter(User.email == email)
    if user_id_courant is not None:
        query = query.filter(User.id != user_id_courant)

    existe = query.first()
    if not existe:
        return

    if existe.deleted_at is not None:
        raise HTTPException(
            status_code=409,
            detail=(
                "Un compte supprime existe deja avec cet email. "
                "Demandez a un admin de restaurer ce compte."
            ),
        )

    raise HTTPException(status_code=400, detail="Email deja utilise")


def get_all_users(db: Session, actor: User):
    return db.query(User).filter(User.deleted_at.is_(None)).order_by(User.created_at.desc()).all()


def get_all_deleted_users(db: Session, actor: User):
    return db.query(User).filter(User.deleted_at.is_not(None)).order_by(User.deleted_at.desc()).all()


def get_user_by_id(db: Session, user_id: int, actor: User):
    return _recuperer_user_ou_404(db, user_id)


def update_my_profile(db: Session, current_user: User, data):
    utilisateur = _recuperer_user_ou_404(db, current_user.id)

    if data.nom is not None:
        utilisateur.nom = data.nom.strip()

    if data.prenom is not None:
        utilisateur.prenom = data.prenom.strip()

    if data.email is not None:
        email_normalise = data.email.lower().strip()
        _verifier_email_unique(db, email_normalise, user_id_courant=utilisateur.id)
        utilisateur.email = email_normalise

    db.commit()
    db.refresh(utilisateur)
    return utilisateur


def update_user(db: Session, user_id: int, data, actor: User):
    utilisateur = _recuperer_user_ou_404(db, user_id)

    if data.nom is not None:
        utilisateur.nom = data.nom.strip()

    if data.prenom is not None:
        utilisateur.prenom = data.prenom.strip()

    if data.email is not None:
        email_normalise = data.email.lower().strip()
        _verifier_email_unique(db, email_normalise, user_id_courant=utilisateur.id)
        utilisateur.email = email_normalise

    if data.role is not None:
        utilisateur.role = data.role

    db.commit()
    db.refresh(utilisateur)
    return utilisateur


def delete_user(db: Session, user_id: int, actor: User):
    utilisateur = _recuperer_user_ou_404(db, user_id)
    utilisateur.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Utilisateur supprime avec succes (soft delete)"}


def restore_user(db: Session, user_id: int, actor: User):
    utilisateur = _recuperer_user_supprime_ou_404(db, user_id)
    utilisateur.deleted_at = None
    db.commit()
    db.refresh(utilisateur)
    return utilisateur
