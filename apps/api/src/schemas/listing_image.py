from datetime import datetime

from src.schemas.base import CamelModel


class ListingImageResponse(CamelModel):
    id: int
    url: str
    listing_id: int | None
    upload_session_id: str | None
    created_at: datetime


class PendingImageResponse(CamelModel):
    id: int
    url: str
    upload_session_id: str
    created_at: datetime
