import os
import re
import smtplib
from email.message import EmailMessage

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from Model.User import User
from dependencies.AuthDependencies import (
    ROLE_ADMIN,
    ROLE_ENTREPRISE,
    ROLE_ETUDIANT,
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_password_reset_token,
    decode_refresh_token,
    hash_password,
    mark_password_reset_token_as_used,
    revoke_access_token,
    revoke_refresh_token,
    verify_password,
)

EMAIL_REGEX = re.compile(r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$")
FORGOT_PASSWORD_SUCCESS_MESSAGE = "Si un compte existe avec cet email, un lien de reinitialisation a ete envoye."


def _normaliser_email(email: str) -> str:
    """Normalise un email (minuscules + suppression des espaces)."""
    return email.lower().strip()


def _valider_et_normaliser_email(email: str) -> str:
    """Valide le format d'email puis retourne la version normalisee."""
    email_normalise = _normaliser_email(email)

    if len(email_normalise) > 254:
        raise HTTPException(status_code=400, detail="Adresse email invalide")

    if not EMAIL_REGEX.match(email_normalise):
        raise HTTPException(status_code=400, detail="Format email invalide")

    return email_normalise


def _get_user_by_email(db: Session, email: str) -> User | None:
    """Recupere un utilisateur par email, ou None s'il n'existe pas."""
    return db.query(User).filter(User.email == email).first()


def _verifier_email_disponible(db: Session, email: str) -> None:
    """Verifie la disponibilite d'un email pour creation de compte."""
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
    """Applique une regle simple de robustesse du mot de passe."""
    if len(mot_de_passe) < 8:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 8 caracteres")


def _as_bool(value: str | None, default: bool = False) -> bool:
    """Convertit une variable d'environnement texte en booleen."""
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _generer_lien_reinitialisation(token: str) -> str:
    """Construit l'URL front de reinitialisation avec le token JWT."""
    # Fallback local pour eviter une erreur si la variable d'env n'est pas fournie.
    base_url = os.getenv("RESET_PASSWORD_URL") or "http://localhost:5173/reset-password"
    separateur = "&" if "?" in base_url else "?"
    return f"{base_url}{separateur}token={token}"


def _envoyer_email_reset_mot_de_passe(destinataire: str, reset_link: str) -> None:
    """Envoie l'email de reinitialisation via SMTP."""
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM")
    smtp_use_tls = _as_bool(os.getenv("SMTP_USE_TLS", "true"), default=True)
    smtp_use_ssl = _as_bool(os.getenv("SMTP_USE_SSL", "false"), default=False)

    if not smtp_host or not smtp_from:
        raise HTTPException(
            status_code=503,
            detail="Service email non configure. Contactez l'administrateur.",
        )

    message = EmailMessage()
    message["Subject"] = "Reinitialisation de votre mot de passe TalentBridge"
    message["From"] = smtp_from
    message["To"] = destinataire
    message.set_content(
        "Bonjour,\n\n"
        "Vous avez demande la reinitialisation de votre mot de passe.\n"
        f"Cliquez sur ce lien: {reset_link}\n\n"
        "Si vous n'etes pas a l'origine de cette demande, ignorez cet email."
    )

    try:
        if smtp_use_ssl:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
                if smtp_user and smtp_password:
                    server.login(smtp_user, smtp_password)
                server.send_message(message)
            return

        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            if smtp_use_tls:
                server.starttls()
            if smtp_user and smtp_password:
                server.login(smtp_user, smtp_password)
            server.send_message(message)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Impossible d'envoyer l'email de reinitialisation pour le moment.",
        ) from exc


def register_user(db: Session, user_data):
    """Inscrit un nouvel utilisateur apres validations metier."""
    email = _valider_et_normaliser_email(user_data.email)
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
    """Authentifie l'utilisateur et retourne access + refresh token."""
    email = _valider_et_normaliser_email(data.email)
    utilisateur = _get_user_by_email(db, email)

    if not utilisateur or not verify_password(data.motDePasse, utilisateur.motDePasse):
        raise HTTPException(status_code=401, detail="Identifiants invalides")

    if utilisateur.deleted_at is not None:
        raise HTTPException(status_code=403, detail="Ce compte est supprime. Contactez un admin.")

    access_token = create_access_token(user_id=utilisateur.id, role=utilisateur.role)
    refresh_token = create_refresh_token(user_id=utilisateur.id, role=utilisateur.role)

    return {"access_token": access_token, "refresh_token": refresh_token}


def refresh_user_session(db: Session, refresh_token: str):
    """Regroupe la logique de renouvellement du token d'acces."""
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
    """Revoque le token d'acces et optionnellement le refresh token."""
    if refresh_token:
        payload = decode_refresh_token(refresh_token)
        if payload.get("user_id") != current_user.id or payload.get("role") != current_user.role:
            raise HTTPException(status_code=403, detail="Refresh token ne correspond pas a l'utilisateur connecte")
        revoke_refresh_token(refresh_token)

    revoke_access_token(access_token)

    return {"message": "Deconnexion effectuee avec succes"}


def create_user_by_developer(db: Session, user_data, current_user: User):
    """Permet a un admin de creer un compte utilisateur."""
    if current_user.role != ROLE_ADMIN:
        raise HTTPException(status_code=403, detail="Acces admin requis")

    email = _valider_et_normaliser_email(user_data.email)
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


def forgot_password(db: Session, data):
    """Declenche la procedure 'mot de passe oublie' via email."""
    email = _valider_et_normaliser_email(data.email)
    utilisateur = _get_user_by_email(db, email)

    if not utilisateur or utilisateur.deleted_at is not None:
        return {"message": FORGOT_PASSWORD_SUCCESS_MESSAGE}

    token = create_password_reset_token(user_id=utilisateur.id, role=utilisateur.role)
    reset_link = _generer_lien_reinitialisation(token)
    _envoyer_email_reset_mot_de_passe(destinataire=utilisateur.email, reset_link=reset_link)

    return {"message": FORGOT_PASSWORD_SUCCESS_MESSAGE}


def reset_password(db: Session, data):
    """Reinitialise le mot de passe en mode direct (email + nouveau mot de passe)."""
    email = _valider_et_normaliser_email(data.email)
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


def reset_password_with_token(db: Session, data):
    """Reinitialise le mot de passe a partir d'un token de reset recu par email."""
    _verifier_force_mot_de_passe(data.nouveauMotDePasse)

    payload = decode_password_reset_token(data.token)
    user_id = payload.get("user_id")
    role = payload.get("role")

    if user_id is None or role is None:
        raise HTTPException(status_code=401, detail="Payload token invalide")

    utilisateur = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if utilisateur.role != role:
        raise HTTPException(status_code=401, detail="Role du token obsolete")

    utilisateur.motDePasse = hash_password(data.nouveauMotDePasse)
    mark_password_reset_token_as_used(data.token)
    db.commit()

    return {"message": "Mot de passe mis a jour"}
