from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.dependencies.auth import get_current_user
from src.models.user import User
from src.services import favorite as fav_service

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.get("/")
async def get_favorites(
    page: int = 1, limit: int = 15,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await fav_service.get_favorites(db, current_user.id, page, limit)


@router.get("/ids")
async def get_favorite_ids(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ids = await fav_service.get_favorite_ids(db, current_user.id)
    return {"favorite_ids": ids}


@router.get("/{listing_id}/check")
async def check_favorite(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_fav = await fav_service.check_favorite(db, current_user.id, listing_id)
    return {"is_favorited": is_fav}


@router.post("/{listing_id}")
async def add_favorite(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    added = await fav_service.add_favorite(db, current_user.id, listing_id)
    return {"success": True, "added": added, "message": "Favorite added" if added else "Already favorited"}


@router.delete("/{listing_id}")
async def remove_favorite(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await fav_service.remove_favorite(db, current_user.id, listing_id)
    return {"removed": True}
