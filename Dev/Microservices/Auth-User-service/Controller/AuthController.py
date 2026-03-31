from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from Model.User import User
from dependencies.AuthDependencies import (
    ROLE_ADMIN,
    ROLE_ENTREPRISE,
    ROLE_ETUDIANT,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    revoke_access_token,
    revoke_refresh_token,
    verify_password,
)


def _normaliser_email(email: str) -> str:
    return email.lower().strip()


def _get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def _verifier_email_disponible(db: Session, email: str) -> None:
    utilisateur = _get_user_by_email(db, email)
    if not utilisateur:
        return

    if utilisateur.deleted_at is not None:
        raise HTTPException(
            status_code=409,
            detail=(
                "Un compte supprime existe deja avec cet email. "
                "Demandez a un admin de restaurer ce compte."
            ),
        )

    raise HTTPException(status_code=400, detail="Email deja utilise")


def _verifier_force_mot_de_passe(mot_de_passe: str) -> None:
    if len(mot_de_passe) < 8:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 8 caracteres")


def register_user(db: Session, user_data):
    email = _normaliser_email(user_data.email)
    _verifier_email_disponible(db, email)
    _verifier_force_mot_de_passe(user_data.motDePasse)

    nouvel_utilisateur = User(
        nom=user_data.nom.strip(),
        prenom=user_data.prenom.strip(),
        email=email,
        motDePasse=hash_password(user_data.motDePasse),
        role=user_data.role,
    )

    try:
        db.add(nouvel_utilisateur)
        db.commit()
        db.refresh(nouvel_utilisateur)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email deja utilise") from exc

    return nouvel_utilisateur


def login_user(db: Session, data):
    email = _normaliser_email(data.email)
    utilisateur = _get_user_by_email(db, email)

    if not utilisateur or not verify_password(data.motDePasse, utilisateur.motDePasse):
        raise HTTPException(status_code=401, detail="Identifiants invalides")

    if utilisateur.deleted_at is not None:
        raise HTTPException(status_code=403, detail="Ce compte est supprime. Contactez un admin.")

    access_token = create_access_token(user_id=utilisateur.id, role=utilisateur.role)
    refresh_token = create_refresh_token(user_id=utilisateur.id, role=utilisateur.role)

    return {"access_token": access_token, "refresh_token": refresh_token}


def refresh_user_session(db: Session, refresh_token: str):
    payload = decode_refresh_token(refresh_token)
    user_id = payload.get("user_id")
    role = payload.get("role")

    if user_id is None or role is None:
        raise HTTPException(status_code=401, detail="Payload refresh token invalide")

    utilisateur = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not utilisateur or utilisateur.role != role:
        raise HTTPException(status_code=401, detail="Utilisateur non autorise")

    nouveau_access_token = create_access_token(user_id=utilisateur.id, role=utilisateur.role)
    return {"access_token": nouveau_access_token}


def logout_user(access_token: str, current_user: User, refresh_token: str | None = None):
    revoke_access_token(access_token)

    if refresh_token:
        payload = decode_refresh_token(refresh_token)
        if payload.get("user_id") != current_user.id or payload.get("role") != current_user.role:
            raise HTTPException(status_code=403, detail="Refresh token ne correspond pas a l'utilisateur connecte")
        revoke_refresh_token(refresh_token)

    return {"message": "Deconnexion effectuee avec succes"}


def create_user_by_developer(db: Session, user_data, current_user: User):
    if current_user.role != ROLE_ADMIN:
        raise HTTPException(status_code=403, detail="Acces admin requis")

    email = _normaliser_email(user_data.email)
    _verifier_email_disponible(db, email)
    _verifier_force_mot_de_passe(user_data.motDePasse)

    if user_data.role not in {ROLE_ADMIN, ROLE_ENTREPRISE, ROLE_ETUDIANT}:
        raise HTTPException(status_code=400, detail="Role non supporte")

    nouvel_utilisateur = User(
        nom=user_data.nom.strip(),
        prenom=user_data.prenom.strip(),
        email=email,
        motDePasse=hash_password(user_data.motDePasse),
        role=user_data.role,
    )

    try:
        db.add(nouvel_utilisateur)
        db.commit()
        db.refresh(nouvel_utilisateur)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email deja utilise") from exc

    return nouvel_utilisateur


def reset_password(db: Session, data):
    email = _normaliser_email(data.email)
    _verifier_force_mot_de_passe(data.nouveauMotDePasse)

    utilisateur = _get_user_by_email(db, email)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if utilisateur.deleted_at is not None:
        raise HTTPException(
            status_code=403,
            detail="Ce compte est supprime. Demandez une restauration admin avant reset.",
        )

    utilisateur.motDePasse = hash_password(data.nouveauMotDePasse)
    db.commit()

    return {"message": "Mot de passe mis a jour"}
