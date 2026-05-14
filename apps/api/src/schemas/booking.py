from pydantic import BaseModel
from datetime import datetime


class BookingResponse(BaseModel):
    id: int
    status: str | None
    scheduled_at: datetime
    meet_link: str | None
    created_at: datetime | None
    candidate_id: int
    landlord_id: int
    listing_id: int
    availability_slot_id: int | None

    model_config = {"from_attributes": True}


class CreateBookingRequest(BaseModel):
    listing_id: int
    scheduled_at: datetime
    meet_link: str | None = None
    availability_slot_id: int | None = None


class UpdateBookingRequest(BaseModel):
    status: str | None = None
    scheduled_at: datetime | None = None
    meet_link: str | None = None


class BookingIdParam(BaseModel):
    id: int
