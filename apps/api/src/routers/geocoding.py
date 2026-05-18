from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.dependencies.auth import get_current_user
from src.models.user import User
from src.services import geocoding

router = APIRouter(prefix="/geocoding", tags=["Geocoding"])


@router.get("/search")
async def search(
    text: str,
    country_code: str | None = None,
    limit: int = 10,
    lang: str = "el",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = await geocoding.search(db, text, country_code, limit, lang)
    return {"results": results}


@router.get("/reverse")
async def reverse(
    lat: float,
    lon: float,
    lang: str = "el",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await geocoding.reverse(db, lat, lon, lang)
    return {"result": result}
