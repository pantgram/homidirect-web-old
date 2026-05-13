from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.main import limiter
from src.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from src.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
@limiter.limit("5/minute")
async def register(request: Request, body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.register(db, body.first_name, body.last_name, body.email, body.password, body.role)


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.login(db, body.email, body.password)


@router.post("/refresh")
async def refresh(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.refresh(db, body.refresh_token)


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.forgot_password(db, body.email)


@router.post("/reset-password")
@limiter.limit("3/minute")
async def reset_password(request: Request, body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.reset_password(db, body.token, body.password)
