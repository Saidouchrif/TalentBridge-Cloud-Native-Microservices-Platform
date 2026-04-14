import os

from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from Model.User import User
from Schemas.UserSchema import UserResponseSchema

router = APIRouter(prefix="/internal", tags=["Internal"])

SERVICE_TOKEN = os.getenv("SERVICE_INTERNAL_TOKEN", "")


def verify_service_token(x_service_token: str = Header(default="")):
    expected = SERVICE_TOKEN.strip()
    if not expected:
        raise HTTPException(status_code=503, detail="Service token not configured")
    if x_service_token != expected:
        raise HTTPException(status_code=401, detail="Invalid service token")


@router.get("/utilisateurs", response_model=list[UserResponseSchema])
def internal_list_users(
    db: Session = Depends(get_db),
    _: None = Depends(verify_service_token),
):
    return db.query(User).filter(User.deleted_at.is_(None)).all()


@router.get("/utilisateurs/{user_id}", response_model=UserResponseSchema)
def internal_get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(verify_service_token),
):
    user = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
