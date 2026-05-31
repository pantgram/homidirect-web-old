import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.config.settings import settings
from src.dependencies.auth import require_role
from src.models.user import User
from src.schemas.listing_image import PendingImagesResponse, UploadPendingImageResponse
from src.services import listing_image as img_service
from src.utils.file_validation import validate_image

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.get("/{session_id}", response_model=PendingImagesResponse)
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


@router.post("/{session_id}", status_code=201, response_model=UploadPendingImageResponse)
async def upload_pending_image(
    session_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    if session_id == "new":
        session_id = str(uuid.uuid4())

    file_bytes = await file.read()
    detected_type = validate_image(file_bytes, file.filename or "image", file.content_type, settings.max_file_size)

    img = await img_service.upload_pending_image(db, session_id, file_bytes, file.filename or "image", detected_type)
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
