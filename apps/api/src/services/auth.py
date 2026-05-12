import hashlib
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.user import User
from src.utils.hash import hash_password, verify_password
from src.utils.email import send_password_reset_email
from src.utils.errors import ConflictError, UnauthorizedError
from src.dependencies.auth import create_access_token, create_refresh_token
import secrets


async def register(db: AsyncSession, first_name: str, last_name: str, email: str, password: str, role: str):
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise ConflictError("Email already registered")

    hashed = hash_password(password)
    user = User(
        email=email,
        password=hashed,
        first_name=first_name,
        last_name=last_name,
        role=role,
        auth_provider="EMAIL",
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    payload = {"id": user.id, "email": user.email, "role": user.role}
    access = create_access_token(payload)
    refresh_t = create_refresh_token(payload)
    return {
        "user": {
            "id": user.id, "firstName": user.first_name, "lastName": user.last_name,
            "email": user.email, "role": user.role,
            "createdAt": user.created_at.isoformat() if user.created_at else None,
        },
        "token": {"accessToken": access, "refreshToken": refresh_t},
    }


async def login(db: AsyncSession, email: str, password: str):
    result = await db.execute(
        select(User.id, User.email, User.role, User.password).where(User.email == email)
    )
    row = result.first()
    if not row:
        raise UnauthorizedError("No account found with this email address")

    if not row.password:
        raise UnauthorizedError("This account uses Google sign-in. Please use Google to log in.")

    if not verify_password(password, row.password):
        raise UnauthorizedError("Incorrect password")

    payload = {"id": row.id, "email": row.email, "role": row.role}
    return {
        "token": {
            "accessToken": create_access_token(payload),
            "refreshToken": create_refresh_token(payload),
        }
    }


async def refresh(db: AsyncSession, refresh_token: str):
    from jose import jwt, JWTError
    from src.config.settings import settings
    try:
        payload = jwt.decode(refresh_token, settings.jwt_secret, algorithms=["HS256"])
    except JWTError:
        raise UnauthorizedError("Invalid refresh token")

    data = {"id": payload["id"], "email": payload["email"], "role": payload["role"]}
    return {
        "tokens": {
            "accessToken": create_access_token(data),
            "refreshToken": create_refresh_token(data),
        }
    }


async def forgot_password(db: AsyncSession, email: str):
    result = await db.execute(select(User.id, User.email).where(User.email == email))
    user = result.first()

    if not user:
        return {"message": "If an account exists with this email, a reset link has been sent"}

    reset_token = secrets.token_hex(32)
    hashed_token = hashlib.sha256(reset_token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc).timestamp() + 3600

    result2 = await db.execute(
        select(User).where(User.id == user.id)
    )
    db_user = result2.scalar_one()
    db_user.password_reset_token = hashed_token
    db_user.password_reset_expires = datetime.fromtimestamp(expires_at, tz=timezone.utc)
    db_user.updated_at = datetime.now(timezone.utc)

    send_password_reset_email.delay(user.email, reset_token)

    return {"message": "If an account exists with this email, a reset link has been sent"}


async def reset_password(db: AsyncSession, token: str, password: str):
    hashed_token = hashlib.sha256(token.encode()).hexdigest()
    result = await db.execute(
        select(User).where(
            User.password_reset_token == hashed_token,
            User.password_reset_expires > datetime.now(timezone.utc),
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedError("Invalid or expired reset token")

    user.password = hash_password(password)
    user.password_reset_token = None
    user.password_reset_expires = None
    user.updated_at = datetime.now(timezone.utc)

    return {"message": "Password has been reset successfully"}
