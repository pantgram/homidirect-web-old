from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.dependencies.auth import get_current_user
from src.models.user import User
from src.services import auth as auth_service
from src.schemas.auth import (
    RegisterRequest, LoginRequest, RefreshTokenRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.register(db, body.first_name, body.last_name, body.email, body.password, body.role)


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.login(db, body.email, body.password)


@router.post("/refresh")
async def refresh(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.refresh(db, body.refresh_token)


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.forgot_password(db, body.email)


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.reset_password(db, body.token, body.password)
