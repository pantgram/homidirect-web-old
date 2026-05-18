from datetime import datetime

from src.schemas.base import CamelModel


class VerificationDocumentResponse(CamelModel):
    id: int
    listing_id: int
    document_type: str
    url: str
    file_name: str
    uploaded_by: int
    created_at: datetime


class VerificationHistoryResponse(CamelModel):
    id: int
    listing_id: int
    previous_status: str | None
    new_status: str
    notes: str | None
    reviewed_by: int | None
    created_at: datetime


class VerificationStatusResponse(CamelModel):
    listing_id: int
    verification_status: str
    verified_at: datetime | None
    documents: list[VerificationDocumentResponse]
    history: list[VerificationHistoryResponse]
    can_resubmit: bool


class ReviewVerificationRequest(CamelModel):
    status: str
    notes: str | None = None


class PendingVerificationListing(CamelModel):
    id: int
    title: str
    city: str
    landlord_id: int
    verification_status: str
    created_at: datetime
    documents: list[VerificationDocumentResponse]
