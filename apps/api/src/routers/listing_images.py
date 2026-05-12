from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.dependencies.auth import require_role, verify_listing_ownership
from src.models.user import User
from src.services import listing_image as img_service
from src.config.settings import settings

router = APIRouter(prefix="/listings", tags=["Listing Images"])


@router.get("/{listing_id}/images")
async def get_images(listing_id: int, db: AsyncSession = Depends(get_db)):
    images = await img_service.get_images_by_listing_id(db, listing_id)
    return {"images": [
        {"id": i.id, "url": i.url, "listingId": i.listing_id, "uploadSessionId": i.upload_session_id, "createdAt": i.created_at.isoformat()}
        for i in images
    ]}


@router.post("/{listing_id}/images", status_code=201)
async def upload_image(
    listing_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    await verify_listing_ownership(listing_id, db, current_user)
    if file.content_type not in settings.allowed_mime_types:
        raise HTTPException(status_code=400, detail=f"File type {file.content_type} not allowed")

    file_bytes = await file.read()
    if len(file_bytes) > settings.max_file_size:
        raise HTTPException(status_code=400, detail="File too large")

    img = await img_service.upload_listing_image(db, listing_id, file_bytes, file.filename or "image", file.content_type)
    return {"image": {"id": img.id, "url": img.url, "listingId": img.listing_id, "uploadSessionId": img.upload_session_id, "createdAt": img.created_at.isoformat()}}


@router.delete("/{listing_id}/images/{image_id}", status_code=204)
async def delete_image(
    listing_id: int,
    image_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    await verify_listing_ownership(listing_id, db, current_user)
    deleted = await img_service.delete_image(db, image_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Image not found")
