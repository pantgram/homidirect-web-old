import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.dependencies.auth import get_current_user
from src.models.user import User
from src.schemas.geocoding import (
    AddressSearchResponse,
    GeocodingReverseResponse,
    GeocodingSearchResponse,
)
from src.services import geocoding

router = APIRouter(prefix="/geocoding", tags=["Geocoding"])


@router.get("/search", response_model=GeocodingSearchResponse)
async def search(
    text: str,
    country_code: str | None = None,
    limit: int = 10,
    lang: str = "el",
    type: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = await geocoding.search(db, text, country_code, limit, lang, type)
    return {"results": results}


@router.get("/address-search", response_model=AddressSearchResponse)
async def address_search(
    text: str,
    country_code: str | None = None,
    limit: int = 10,
    lang: str = "el",
    type: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Street-focused search for the listing flow.

    Returns entries in ``{address, context, formatted_address, geometry, type}``
    shape (matches the reference listing-flow payload).
    """
    results = await geocoding.address_search(db, text, country_code, limit, lang, type)
    return {
        "request_id": uuid.uuid4().hex,
        "results": results,
        "status": "OK" if results else "ZERO_RESULTS",
    }


@router.get("/reverse", response_model=GeocodingReverseResponse)
async def reverse(
    lat: float,
    lon: float,
    lang: str = "el",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await geocoding.reverse(db, lat, lon, lang)
    return {"result": result}
