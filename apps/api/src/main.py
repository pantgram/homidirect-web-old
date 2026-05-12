from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from src.config.settings import settings
from src.utils.errors import AppError
from src.middleware.camel_case import CamelCaseMiddleware


async def _app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": type(exc).__name__, "message": exc.message},
    )


async def _generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "message": "An unexpected error occurred"},
    )


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="HomiDirect API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(AppError, _app_error_handler)
app.add_exception_handler(Exception, _generic_error_handler)

app.add_middleware(CamelCaseMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from src.routers import (
    auth,
    google_auth,
    users,
    favorites,
    listings,
    listing_images,
    uploads,
    bookings,
    availability_slots,
    verification,
    geocoding,
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(google_auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(favorites.router, prefix=api_prefix)
app.include_router(listings.router, prefix=api_prefix)
app.include_router(listing_images.router, prefix=api_prefix)
app.include_router(uploads.router, prefix=api_prefix)
app.include_router(bookings.router, prefix=api_prefix)
app.include_router(availability_slots.router, prefix=api_prefix)
app.include_router(verification.router, prefix=api_prefix)
app.include_router(verification.admin_router, prefix=api_prefix)
app.include_router(geocoding.router, prefix=api_prefix)
