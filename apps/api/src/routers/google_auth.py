import secrets
import time

from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.schemas.auth import ExchangeCodeRequest
from src.services import google_auth

router = APIRouter(prefix="/auth/google", tags=["Google Auth"])

_state_store: dict[str, float] = {}
_auth_code_store: dict[str, tuple[dict, float]] = {}

_STATE_TTL_SECONDS = 600
_AUTH_CODE_TTL_SECONDS = 60


def _cleanup_expired_states():
    now = time.time()
    expired = [k for k, v in _state_store.items() if now - v > _STATE_TTL_SECONDS]
    for k in expired:
        del _state_store[k]

    expired_codes = [k for k, (_, ts) in _auth_code_store.items() if now - ts > _AUTH_CODE_TTL_SECONDS]
    for k in expired_codes:
        del _auth_code_store[k]


@router.get("/")
async def google_auth_redirect():
    _cleanup_expired_states()
    state = secrets.token_urlsafe(32)
    _state_store[state] = time.time()
    url = google_auth.get_google_auth_url(state)
    return RedirectResponse(url)


@router.get("/callback")
async def google_auth_callback(code: str, state: str, db: AsyncSession = Depends(get_db)):
    if state not in _state_store:
        from src.utils.errors import UnauthorizedError
        raise UnauthorizedError("Invalid state parameter")
    stored_time = _state_store.pop(state)
    if time.time() - stored_time > _STATE_TTL_SECONDS:
        from src.utils.errors import UnauthorizedError
        raise UnauthorizedError("State parameter expired")

    tokens = await google_auth.exchange_code_for_tokens(code)
    user_info = await google_auth.get_google_user_info(tokens["access_token"])
    result = await google_auth.find_or_create_user(db, user_info)

    auth_code = secrets.token_urlsafe(32)
    _auth_code_store[auth_code] = (
        {"access_token": result["access_token"], "refresh_token": result["refresh_token"]},
        time.time(),
    )

    from src.config.settings import settings
    redirect_url = f"{settings.frontend_url}/auth/callback?code={auth_code}"
    return RedirectResponse(redirect_url)


@router.post("/exchange")
async def exchange_auth_code(body: ExchangeCodeRequest):
    entry = _auth_code_store.pop(body.code, None)
    if not entry:
        from src.utils.errors import UnauthorizedError
        raise UnauthorizedError("Invalid or expired authorization code")

    token_data, created_at = entry
    if time.time() - created_at > _AUTH_CODE_TTL_SECONDS:
        from src.utils.errors import UnauthorizedError
        raise UnauthorizedError("Authorization code expired")

    return {
        "token": {
            "accessToken": token_data["access_token"],
            "refreshToken": token_data["refresh_token"],
        }
    }
