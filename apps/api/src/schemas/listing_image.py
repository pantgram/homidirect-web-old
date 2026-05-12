from pydantic import BaseModel
from datetime import datetime


class ListingImageResponse(BaseModel):
    id: int
    url: str
    listing_id: int | None
    upload_session_id: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PendingImageResponse(BaseModel):
    id: int
    url: str
    upload_session_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
