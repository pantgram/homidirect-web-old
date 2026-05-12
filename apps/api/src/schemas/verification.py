from pydantic import BaseModel
from datetime import datetime


class VerificationDocumentResponse(BaseModel):
    id: int
    listing_id: int
    document_type: str
    url: str
    file_name: str
    uploaded_by: int
    created_at: datetime

    model_config = {"from_attributes": True}


class VerificationHistoryResponse(BaseModel):
    id: int
    listing_id: int
    previous_status: str | None
    new_status: str
    notes: str | None
    reviewed_by: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class VerificationStatusResponse(BaseModel):
    listing_id: int
    verification_status: str
    verified_at: datetime | None
    documents: list[VerificationDocumentResponse]
    history: list[VerificationHistoryResponse]
    can_resubmit: bool


class ReviewVerificationRequest(BaseModel):
    status: str
    notes: str | None = None


class PendingVerificationListing(BaseModel):
    id: int
    title: str
    city: str
    landlord_id: int
    verification_status: str
    created_at: datetime
    documents: list[VerificationDocumentResponse]

    model_config = {"from_attributes": True}
