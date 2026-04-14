from fastapi import APIRouter

from .AuthRoute import router as auth_router
from .UserRoutes import router as user_router
from .InternalRoutes import router as internal_router


router = APIRouter()

router.include_router(auth_router)
router.include_router(user_router)
router.include_router(internal_router)