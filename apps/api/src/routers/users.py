from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.dependencies.auth import get_current_user, verify_user_ownership
from src.models.user import User
from src.services import user as user_service
from src.services import favorite as fav_service
from src.schemas.user import UserResponse, UserWithRoleResponse, UpdateUserRequest

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "firstName": current_user.first_name,
        "lastName": current_user.last_name,
        "email": current_user.email,
        "role": current_user.role,
        "createdAt": current_user.created_at.isoformat() if current_user.created_at else None,
    }


@router.get("/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = await user_service.get_user_by_id(db, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": row.id,
        "firstName": row.first_name,
        "lastName": row.last_name,
        "email": row.email,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }


@router.patch("/{user_id}")
async def update_user(
    user_id: int,
    body: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await verify_user_ownership(user_id, current_user)
    data = body.model_dump(exclude_none=True)
    if "role" in data and data["role"] == "ADMIN" and current_user.role != "ADMIN":
        del data["role"]
    user = await user_service.update_user(db, user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "email": user.email,
        "role": user.role,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    }


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await verify_user_ownership(user_id, current_user)
    deleted = await user_service.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
