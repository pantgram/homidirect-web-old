import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.dependencies.auth import require_role
from src.models.user import User
from src.services import listing_image as img_service
from src.config.settings import settings

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.get("/{session_id}")
async def get_pending_images(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    images = await img_service.get_images_by_session_id(db, session_id)
    return {"images": [
        {
            "id": i.id,
            "url": i.url,
            "upload_session_id": i.upload_session_id,
            "created_at": i.created_at.isoformat(),
        }
        for i in images
    ]}


@router.post("/{session_id}", status_code=201)
async def upload_pending_image(
    session_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    if session_id == "new":
        session_id = str(uuid.uuid4())

    if file.content_type not in settings.allowed_mime_types:
        raise HTTPException(status_code=400, detail=f"File type {file.content_type} not allowed")

    file_bytes = await file.read()
    if len(file_bytes) > settings.max_file_size:
        raise HTTPException(status_code=400, detail="File too large")

    img = await img_service.upload_pending_image(db, session_id, file_bytes, file.filename or "image", file.content_type)
    return {
        "image": {
            "id": img.id,
            "url": img.url,
            "upload_session_id": img.upload_session_id,
            "created_at": img.created_at.isoformat(),
        },
        "upload_session_id": img.upload_session_id,
    }


@router.delete("/{session_id}/{image_id}", status_code=204)
async def delete_pending_image(
    session_id: str,
    image_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    deleted = await img_service.delete_pending_image(db, image_id, session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Image not found")
