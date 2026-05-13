import time
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.settings import settings
from src.models.listing import Listing
from src.models.verification_document import VerificationDocument
from src.models.verification_history import VerificationHistory
from src.utils.errors import ConflictError, NotFoundError
from src.utils.storage import delete_from_r2, get_key_from_url, upload_to_r2


async def get_verification_status(db: AsyncSession, listing_id: int):
    listing_r = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = listing_r.scalar_one_or_none()
    if not listing:
        raise NotFoundError("Listing not found")

    docs_r = await db.execute(select(VerificationDocument).where(VerificationDocument.listing_id == listing_id))
    history_r = await db.execute(select(VerificationHistory).where(VerificationHistory.listing_id == listing_id))

    return {
        "listing_id": listing_id,
        "verification_status": listing.verification_status,
        "verified_at": listing.verified_at.isoformat() if listing.verified_at else None,
        "documents": docs_r.scalars().all(),
        "history": history_r.scalars().all(),
        "can_resubmit": listing.verification_status == "REJECTED",
    }


async def get_documents(db: AsyncSession, listing_id: int):
    result = await db.execute(select(VerificationDocument).where(VerificationDocument.listing_id == listing_id))
    return result.scalars().all()


async def get_history(db: AsyncSession, listing_id: int):
    result = await db.execute(select(VerificationHistory).where(VerificationHistory.listing_id == listing_id))
    return result.scalars().all()


async def upload_document(db: AsyncSession, listing_id: int, document_type: str, uploaded_by: int, file_bytes: bytes, filename: str, mimetype: str):
    listing_r = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = listing_r.scalar_one_or_none()
    if not listing:
        raise NotFoundError("Listing not found")

    if mimetype not in settings.allowed_document_mime_types:
        raise ConflictError(f"File type {mimetype} not allowed")

    sanitized = "".join(c if c.isalnum() or c in ".-" else "_" for c in filename)
    key = f"listings/{listing_id}/documents/{int(time.time() * 1000)}-{sanitized}"
    url = upload_to_r2(key, file_bytes, mimetype)

    doc = VerificationDocument(
        listing_id=listing_id,
        document_type=document_type,
        url=url,
        file_name=filename,
        uploaded_by=uploaded_by,
    )
    db.add(doc)

    if listing.verification_status == "REJECTED":
        history = VerificationHistory(
            listing_id=listing_id,
            previous_status="REJECTED",
            new_status="PENDING",
            notes="Resubmitted documents",
            reviewed_by=None,
        )
        db.add(history)
        listing.verification_status = "PENDING"

    await db.flush()
    await db.refresh(doc)
    return doc


async def delete_document(db: AsyncSession, document_id: int, listing_id: int, current_user_id: int):
    result = await db.execute(select(VerificationDocument).where(VerificationDocument.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise NotFoundError("Document not found")

    listing_r = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = listing_r.scalar_one_or_none()
    if listing and listing.verification_status == "APPROVED" and current_user_id != doc.uploaded_by:
        raise ConflictError("Cannot delete documents from approved listing")

    delete_from_r2(get_key_from_url(doc.url))
    await db.delete(doc)
    return True


async def review_verification(db: AsyncSession, listing_id: int, status: str, notes: str | None, reviewer_id: int):
    listing_r = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = listing_r.scalar_one_or_none()
    if not listing:
        raise NotFoundError("Listing not found")

    previous = listing.verification_status
    listing.verification_status = status
    listing.verified_at = datetime.now(timezone.utc) if status == "APPROVED" else None
    listing.verified_by = reviewer_id if status == "APPROVED" else None

    history = VerificationHistory(
        listing_id=listing_id,
        previous_status=previous,
        new_status=status,
        notes=notes,
        reviewed_by=reviewer_id,
    )
    db.add(history)
    await db.flush()
    return listing


async def get_pending_verifications(db: AsyncSession):
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.verification_documents))
        .where(Listing.verification_status == "PENDING")
    )
    listings = result.scalars().all()

    items = []
    for l in listings:
        items.append({
            "id": l.id, "title": l.title, "city": l.city,
            "landlord_id": l.landlord_id, "verification_status": l.verification_status,
            "created_at": l.created_at.isoformat() if l.created_at else None,
            "documents": l.verification_documents,
        })
    return items
