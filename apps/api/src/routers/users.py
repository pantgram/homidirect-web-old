from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.dependencies.auth import get_current_user, verify_user_ownership
from src.models.user import User
from src.schemas.listing import PaginatedListingSearchResponse
from src.schemas.user import (
    AddFavoriteResponse,
    CheckFavoriteResponse,
    FavoriteIdsResponse,
    RemoveFavoriteResponse,
    UpdateUserRequest,
    UserDetailResponse,
    UserWithRoleResponse,
)
from src.services import favorite as fav_service
from src.services import user as user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserWithRoleResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


@router.get("/favorites", response_model=PaginatedListingSearchResponse)
async def get_favorites(
    page: int = 1, limit: int = 15,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await fav_service.get_favorites(db, current_user.id, page, limit)


@router.get("/favorites/ids", response_model=FavoriteIdsResponse)
async def get_favorite_ids(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ids = await fav_service.get_favorite_ids(db, current_user.id)
    return {"favorite_ids": ids}


@router.get("/favorites/{listing_id}/check", response_model=CheckFavoriteResponse)
async def check_favorite(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_fav = await fav_service.check_favorite(db, current_user.id, listing_id)
    return {"is_favorited": is_fav}


@router.post("/favorites/{listing_id}", response_model=AddFavoriteResponse)
async def add_favorite(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    added = await fav_service.add_favorite(db, current_user.id, listing_id)
    return {"success": True, "added": added, "message": "Favorite added" if added else "Already favorited"}


@router.delete("/favorites/{listing_id}", response_model=RemoveFavoriteResponse)
async def remove_favorite(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await fav_service.remove_favorite(db, current_user.id, listing_id)
    return {"removed": True}


@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = await user_service.get_user_by_id(db, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": {
        "id": row.id,
        "first_name": row.first_name,
        "last_name": row.last_name,
        "email": row.email,
        "role": row.role,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }}


@router.patch("/{user_id}", response_model=UserDetailResponse)
async def update_user(
    user_id: int,
    body: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_user_ownership(user_id, current_user)
    data = body.model_dump(exclude_none=True)
    user = await user_service.update_user(db, user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }}


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_user_ownership(user_id, current_user)
    deleted = await user_service.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
