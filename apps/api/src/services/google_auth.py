from urllib.parse import urlencode
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from src.config.settings import settings
from src.models.user import User
from src.utils.errors import ConflictError
from src.dependencies.auth import create_access_token, create_refresh_token


def get_google_auth_url(state: str) -> str:
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_callback_url,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "select_account",
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"


async def exchange_code_for_tokens(code: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.google_callback_url,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_google_user_info(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        return resp.json()


async def find_or_create_user(db: AsyncSession, google_user: dict) -> dict:
    result = await db.execute(select(User).where(User.google_id == google_user["id"]))
    existing = result.scalar_one_or_none()

    if existing:
        payload = {"id": existing.id, "email": existing.email, "role": existing.role, "token_version": existing.token_version}
        return {"access_token": create_access_token(payload), "refresh_token": create_refresh_token(payload)}

    result = await db.execute(select(User).where(User.email == google_user["email"]))
    if result.scalar_one_or_none():
        raise ConflictError("An account with this email already exists. Please log in with your email and password.")

    first_name = google_user.get("given_name") or (google_user.get("name", "User").split(" ")[0])
    last_name = google_user.get("family_name") or " ".join(google_user.get("name", "").split(" ")[1:])

    user = User(
        email=google_user["email"],
        first_name=first_name,
        last_name=last_name,
        google_id=google_user["id"],
        auth_provider="GOOGLE",
        email_verified=google_user.get("verified_email", False),
        role="TENANT",
        password=None,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    payload = {"id": user.id, "email": user.email, "role": user.role, "token_version": user.token_version}
    return {"access_token": create_access_token(payload), "refresh_token": create_refresh_token(payload)}
