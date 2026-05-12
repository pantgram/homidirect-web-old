import secrets
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.services import google_auth

router = APIRouter(prefix="/auth/google", tags=["Google Auth"])

_state_store: dict[str, float] = {}


@router.get("/")
async def google_auth_redirect():
    state = secrets.token_urlsafe(32)
    _state_store[state] = __import__("time").time()
    url = google_auth.get_google_auth_url(state)
    return RedirectResponse(url)


@router.get("/callback")
async def google_auth_callback(code: str, state: str, db: AsyncSession = Depends(get_db)):
    if state not in _state_store:
        from src.utils.errors import UnauthorizedError
        raise UnauthorizedError("Invalid state parameter")
    del _state_store[state]

    tokens = await google_auth.exchange_code_for_tokens(code)
    user_info = await google_auth.get_google_user_info(tokens["access_token"])
    result = await google_auth.find_or_create_user(db, user_info)

    from src.config.settings import settings
    redirect_url = (
        f"{settings.frontend_url}/auth/callback"
        f"#access_token={result['access_token']}&refresh_token={result['refresh_token']}"
    )
    return RedirectResponse(redirect_url)
