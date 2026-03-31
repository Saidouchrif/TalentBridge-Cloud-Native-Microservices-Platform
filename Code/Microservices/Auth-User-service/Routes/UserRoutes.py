from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.database import get_db
from Controller.UserController import (
    delete_user,
    get_all_deleted_users,
    get_all_users,
    get_user_by_id,
    restore_user,
    update_my_profile,
    update_user,
)
from Model.User import User
from Schemas.UserSchema import (
    UpdateMyProfileSchema,
    UpdateUserSchema,
    UserResponseSchema,
)
from dependencies.AuthDependencies import (
    admin_required,
    get_current_user,
)

router = APIRouter(prefix="/utilisateurs", tags=["Utilisateurs"])


@router.get("/profile", response_model=UserResponseSchema)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/", response_model=list[UserResponseSchema])
def list_users(
    db: Session = Depends(get_db),
    manager: User = Depends(admin_required),
):
    return get_all_users(db, manager)


@router.get("/supprimes", response_model=list[UserResponseSchema])
def list_deleted_users(
    db: Session = Depends(get_db),
    manager: User = Depends(admin_required),
):
    return get_all_deleted_users(db, manager)


@router.get("/{user_id}", response_model=UserResponseSchema)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    manager: User = Depends(admin_required),
):
    return get_user_by_id(db, user_id, manager)


@router.put("/profile", response_model=UserResponseSchema)
def update_my_profile_route(
    data: UpdateMyProfileSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_my_profile(db, current_user, data)


@router.put("/{user_id}", response_model=UserResponseSchema)
def update_user_route(
    user_id: int,
    data: UpdateUserSchema,
    db: Session = Depends(get_db),
    manager: User = Depends(admin_required),
):
    return update_user(db, user_id, data, manager)


@router.delete("/{user_id}")
def delete_user_route(
    user_id: int,
    db: Session = Depends(get_db),
    manager: User = Depends(admin_required),
):
    return delete_user(db, user_id, manager)


@router.patch("/{user_id}/restore", response_model=UserResponseSchema)
def restore_user_route(
    user_id: int,
    db: Session = Depends(get_db),
    manager: User = Depends(admin_required),
):
    return restore_user(db, user_id, manager)
