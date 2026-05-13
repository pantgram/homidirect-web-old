import copy
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.config.settings import settings
from src.models.user import User

security_scheme = HTTPBearer(auto_error=False)


class TokenData:
    def __init__(self, id: int, email: str, role: str):
        self.id = id
        self.email = email
        self.role = role


def create_access_token(data: dict) -> str:
    to_encode = copy.copy(data)
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")


def create_refresh_token(data: dict) -> str:
    to_encode = copy.copy(data)
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    try:
        payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=["HS256"])
        user_id: int = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.status in ("BANNED", "SUSPENDED"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Account is {user.status.lower()}")
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    try:
        payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=["HS256"])
        user_id: int = payload.get("id")
        if user_id is None:
            return None
    except JWTError:
        return None

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user and user.status in ("BANNED", "SUSPENDED"):
        return None
    return user


def require_role(*roles: str):
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == "ADMIN":
            return current_user
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return _check


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def verify_user_ownership(user_id: int, current_user: User) -> User:
    if current_user.role == "ADMIN":
        return current_user
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only access your own resources")
    return current_user


async def verify_listing_ownership(listing_id: int, db: AsyncSession, current_user: User) -> User:
    if current_user.role == "ADMIN":
        return current_user
    from src.models.listing import Listing
    result = await db.execute(select(Listing.landlord_id).where(Listing.id == listing_id))
    row = result.first()
    if not row or row[0] != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this listing")
    return current_user


async def verify_booking_ownership(booking_id: int, db: AsyncSession, current_user: User) -> User:
    if current_user.role == "ADMIN":
        return current_user
    from src.models.booking import Booking
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    if not booking or (booking.candidate_id != current_user.id and booking.landlord_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this booking")
    return current_user
