from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.dependencies.auth import get_current_user, require_role, require_admin, verify_listing_ownership
from src.models.user import User
from src.services import verification as ver_service
from src.schemas.verification import ReviewVerificationRequest
from src.config.settings import settings

router = APIRouter(prefix="/listings", tags=["Verification"])


@router.get("/{listing_id}/verification")
async def get_verification_status(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await verify_listing_ownership(listing_id, db, current_user)
    return await ver_service.get_verification_status(db, listing_id)


@router.get("/{listing_id}/verification/documents")
async def get_documents(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await verify_listing_ownership(listing_id, db, current_user)
    docs = await ver_service.get_documents(db, listing_id)
    return [_format_doc(d) for d in docs]


@router.get("/{listing_id}/verification/history")
async def get_history(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await verify_listing_ownership(listing_id, db, current_user)
    history = await ver_service.get_history(db, listing_id)
    return [_format_history(h) for h in history]


@router.post("/{listing_id}/verification/documents", status_code=201)
async def upload_document(
    listing_id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    await verify_listing_ownership(listing_id, db, current_user)

    if file.content_type not in settings.allowed_document_mime_types:
        raise HTTPException(status_code=400, detail=f"File type {file.content_type} not allowed")

    file_bytes = await file.read()
    doc = await ver_service.upload_document(
        db, listing_id, document_type, current_user.id,
        file_bytes, file.filename or "document", file.content_type,
    )
    return _format_doc(doc)


@router.delete("/{listing_id}/verification/documents/{document_id}", status_code=204)
async def delete_document(
    listing_id: int,
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await verify_listing_ownership(listing_id, db, current_user)
    await ver_service.delete_document(db, document_id, listing_id, current_user.id)


admin_router = APIRouter(prefix="/admin/verifications", tags=["Admin Verification"])


@admin_router.post("/{listing_id}/verification/review")
async def review_verification(
    listing_id: int,
    body: ReviewVerificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    listing = await ver_service.review_verification(db, listing_id, body.status, body.notes, current_user.id)
    return {"message": "Verification reviewed", "verification_status": listing.verification_status}


@admin_router.get("/pending")
async def get_pending_verifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return await ver_service.get_pending_verifications(db)


def _format_doc(d):
    return {
        "id": d.id, "listingId": d.listing_id, "documentType": d.document_type,
        "url": d.url, "fileName": d.file_name, "uploadedBy": d.uploaded_by,
        "createdAt": d.created_at.isoformat(),
    }


def _format_history(h):
    return {
        "id": h.id, "listingId": h.listing_id, "previousStatus": h.previous_status,
        "newStatus": h.new_status, "notes": h.notes, "reviewedBy": h.reviewed_by,
        "createdAt": h.created_at.isoformat(),
    }
