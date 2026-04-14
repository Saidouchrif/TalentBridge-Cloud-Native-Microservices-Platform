import os
import re
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage
from html import escape
from urllib.parse import urlparse

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from Model.User import User
from dependencies.AuthDependencies import (
    ROLE_ADMIN,
    ROLE_ENTREPRISE,
    ROLE_ETUDIANT,
    create_access_token,
    create_email_verification_token,
    create_password_reset_token,
    create_refresh_token,
    decode_email_verification_token,
    decode_password_reset_token,
    decode_refresh_token,
    hash_password,
    mark_email_verification_token_as_used,
    mark_password_reset_token_as_used,
    revoke_access_token,
    revoke_refresh_token,
    verify_password,
)

EMAIL_REGEX = re.compile(r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$")
FORGOT_PASSWORD_SUCCESS_MESSAGE = "Si un compte existe avec cet email, un lien de reinitialisation a ete envoye."
RESEND_VERIFICATION_SUCCESS_MESSAGE = "Si un compte existe avec cet email, un lien de verification a ete envoye."


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


def _lire_config_smtp() -> tuple[str, int, str | None, str | None, str, bool, bool]:
    """Lit et valide la configuration SMTP."""
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

    return smtp_host, smtp_port, smtp_user, smtp_password, smtp_from, smtp_use_tls, smtp_use_ssl


def _envoyer_email(destinataire: str, sujet: str, corps_texte: str, corps_html: str | None = None) -> None:
    """Envoie un email transactionnel (texte + HTML optionnel) via SMTP."""
    smtp_host, smtp_port, smtp_user, smtp_password, smtp_from, smtp_use_tls, smtp_use_ssl = _lire_config_smtp()

    message = EmailMessage()
    message["Subject"] = sujet
    message["From"] = smtp_from
    message["To"] = destinataire
    message.set_content(corps_texte)
    if corps_html:
        message.add_alternative(corps_html, subtype="html")

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
            detail="Impossible d'envoyer l'email pour le moment.",
        ) from exc


def _generer_lien_reinitialisation(token: str) -> str:
    """Construit l'URL front de reinitialisation avec le token JWT."""
    base_url = os.getenv("RESET_PASSWORD_URL") or "http://localhost:5173/reset-password"
    separateur = "&" if "?" in base_url else "?"
    return f"{base_url}{separateur}token={token}"


def _generer_lien_verification_email(token: str) -> str:
    """Construit l'URL front de verification email avec le token JWT."""
    base_url = os.getenv("EMAIL_VERIFICATION_URL") or "http://localhost:5173/verify-email"
    separateur = "&" if "?" in base_url else "?"
    return f"{base_url}{separateur}token={token}"


def _extraire_origine(url: str) -> str | None:
    """Extrait l'origine (scheme + host) depuis une URL absolue."""
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        return None
    return f"{parsed.scheme}://{parsed.netloc}"


def _resoudre_logo_url(fallback_action_url: str) -> str:
    """Retourne l'URL du logo pour les emails HTML."""
    logo_env = os.getenv("PLATFORM_LOGO_URL")
    if logo_env:
        return logo_env

    origin = _extraire_origine(fallback_action_url)
    if origin:
        return f"{origin}/logo-talentbridge.png"

    return "https://placehold.co/220x80?text=TalentBridge"


def _build_email_html_template(
    *,
    title: str,
    intro: str,
    action_label: str,
    action_url: str,
    secondary_text: str,
) -> str:
    safe_title = escape(title)
    safe_intro = escape(intro)
    safe_action_label = escape(action_label)
    safe_action_url = escape(action_url)
    safe_secondary_text = escape(secondary_text)
    logo_url = escape(_resoudre_logo_url(action_url))

    return f"""
<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#edf4fa;font-family:Arial,sans-serif;color:#17324b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:26px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:18px;border:1px solid #d4e3ef;overflow:hidden;">
            <tr>
              <td style="padding:24px;background:linear-gradient(145deg,#f4fbff,#effaf4);text-align:center;border-bottom:1px solid #d8e7f2;">
                <img src="{logo_url}" alt="TalentBridge" style="height:72px;max-width:100%;object-fit:contain;" />
                <p style="margin:10px 0 0;color:#3f5870;font-size:13px;">Cloud-Native Microservices Platform</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <h1 style="margin:0 0 10px;font-size:25px;line-height:1.25;color:#0d2b48;">{safe_title}</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#39546f;">{safe_intro}</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px 0;">
                  <tr>
                    <td>
                      <a href="{safe_action_url}" style="display:inline-block;background:#0a6f7f;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">
                        {safe_action_label}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:13px;color:#4a5f72;">
                  Si le bouton ne fonctionne pas, utilisez ce lien:
                </p>
                <p style="margin:0 0 18px;word-break:break-word;font-size:13px;">
                  <a href="{safe_action_url}" style="color:#0b5f96;text-decoration:underline;">{safe_action_url}</a>
                </p>
                <p style="margin:0;font-size:13px;color:#5b6f82;line-height:1.6;">{safe_secondary_text}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
""".strip()


def _envoyer_email_reset_mot_de_passe(destinataire: str, reset_link: str) -> None:
    """Envoie l'email de reinitialisation via SMTP."""
    corps_texte = (
        "Bonjour,\n\n"
        "Vous avez demande la reinitialisation de votre mot de passe.\n"
        f"Cliquez sur ce lien: {reset_link}\n\n"
        "Si vous n'etes pas a l'origine de cette demande, ignorez cet email."
    )
    corps_html = _build_email_html_template(
        title="Reinitialisation de mot de passe",
        intro="Vous avez demande la reinitialisation de votre mot de passe TalentBridge.",
        action_label="Changer mon mot de passe",
        action_url=reset_link,
        secondary_text="Si vous n'etes pas a l'origine de cette demande, ignorez cet email.",
    )
    _envoyer_email(
        destinataire=destinataire,
        sujet="Reinitialisation de votre mot de passe TalentBridge",
        corps_texte=corps_texte,
        corps_html=corps_html,
    )


def _envoyer_email_verification(destinataire: str, verification_link: str) -> None:
    """Envoie l'email de verification de compte."""
    corps_texte = (
        "Bonjour,\n\n"
        "Merci de verifier votre adresse email pour activer votre compte.\n"
        f"Cliquez sur ce lien: {verification_link}\n\n"
        "Si vous n'etes pas a l'origine de cette demande, ignorez cet email."
    )
    corps_html = _build_email_html_template(
        title="Verification de votre email",
        intro="Confirmez votre email pour activer pleinement votre compte TalentBridge.",
        action_label="Verifier mon email",
        action_url=verification_link,
        secondary_text="Si vous n'etes pas a l'origine de cette demande, ignorez cet email.",
    )
    _envoyer_email(
        destinataire=destinataire,
        sujet="Verification de votre email TalentBridge",
        corps_texte=corps_texte,
        corps_html=corps_html,
    )


def _envoyer_verification_pour_utilisateur(utilisateur: User) -> None:
    """Genere et envoie un email de verification pour un utilisateur donne."""
    token = create_email_verification_token(user_id=utilisateur.id, role=utilisateur.role)
    verification_link = _generer_lien_verification_email(token)
    _envoyer_email_verification(destinataire=utilisateur.email, verification_link=verification_link)


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
        email_verifie=False,
    )

    try:
        db.add(nouvel_utilisateur)
        db.commit()
        db.refresh(nouvel_utilisateur)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email deja utilise") from exc

    # L'inscription ne doit pas echouer si SMTP est indisponible.
    try:
        _envoyer_verification_pour_utilisateur(nouvel_utilisateur)
    except HTTPException:
        pass

    return nouvel_utilisateur


def login_user(db: Session, data):
    """Authentifie l'utilisateur et retourne access + refresh token."""
    email = _valider_et_normaliser_email(data.email)
    utilisateur = _get_user_by_email(db, email)

    if not utilisateur or not verify_password(data.motDePasse, utilisateur.motDePasse):
        raise HTTPException(status_code=401, detail="Identifiants invalides")

    if utilisateur.deleted_at is not None:
        raise HTTPException(status_code=403, detail="Ce compte est supprime. Contactez un admin.")

    require_email_verification = _as_bool(os.getenv("REQUIRE_EMAIL_VERIFICATION_ON_LOGIN", "false"), default=False)
    if require_email_verification and not utilisateur.email_verifie:
        raise HTTPException(status_code=403, detail="Email non verifie. Verifiez votre boite mail.")

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
        email_verifie=False,
    )

    try:
        db.add(nouvel_utilisateur)
        db.commit()
        db.refresh(nouvel_utilisateur)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email deja utilise") from exc

    return nouvel_utilisateur


def resend_verification_email(db: Session, data):
    """Renvoye un email de verification pour un compte non verifie."""
    email = _valider_et_normaliser_email(data.email)
    utilisateur = _get_user_by_email(db, email)

    if not utilisateur or utilisateur.deleted_at is not None:
        return {"message": RESEND_VERIFICATION_SUCCESS_MESSAGE}

    if utilisateur.email_verifie:
        return {"message": "Email deja verifie"}

    _envoyer_verification_pour_utilisateur(utilisateur)
    return {"message": RESEND_VERIFICATION_SUCCESS_MESSAGE}


def verify_email_with_token(db: Session, data):
    """Valide l'email utilisateur a partir d'un token de verification."""
    payload = decode_email_verification_token(data.token)
    user_id = payload.get("user_id")
    role = payload.get("role")

    if user_id is None or role is None:
        raise HTTPException(status_code=401, detail="Payload token invalide")

    utilisateur = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if utilisateur.role != role:
        raise HTTPException(status_code=401, detail="Role du token obsolete")

    if utilisateur.email_verifie:
        mark_email_verification_token_as_used(data.token)
        return {"message": "Email deja verifie"}

    utilisateur.email_verifie = True
    utilisateur.email_verifie_at = datetime.now(timezone.utc)
    mark_email_verification_token_as_used(data.token)
    db.commit()

    return {"message": "Email verifie avec succes"}


def change_password(db: Session, data, current_user: User):
    """Change le mot de passe d'un utilisateur connecte (ancien + nouveau)."""
    _verifier_force_mot_de_passe(data.nouveauMotDePasse)

    if not verify_password(data.ancienMotDePasse, current_user.motDePasse):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")

    if data.ancienMotDePasse == data.nouveauMotDePasse:
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit etre different de l'ancien")

    utilisateur = db.query(User).filter(User.id == current_user.id, User.deleted_at.is_(None)).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    utilisateur.motDePasse = hash_password(data.nouveauMotDePasse)
    db.commit()

    return {"message": "Mot de passe modifie avec succes"}


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
