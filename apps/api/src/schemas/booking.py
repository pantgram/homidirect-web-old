from datetime import datetime

from src.schemas.base import CamelModel


class BookingResponse(CamelModel):
    id: int
    status: str | None
    scheduled_at: datetime
    meet_link: str | None
    created_at: datetime | None
    candidate_id: int
    landlord_id: int
    listing_id: int
    availability_slot_id: int | None


class CreateBookingRequest(CamelModel):
    listing_id: int
    scheduled_at: datetime
    meet_link: str | None = None
    availability_slot_id: int | None = None


class UpdateBookingRequest(CamelModel):
    status: str | None = None
    scheduled_at: datetime | None = None
    meet_link: str | None = None


class BookingIdParam(CamelModel):
    id: int


class BookingDetailResponse(CamelModel):
    booking: BookingResponse


class BookingsListResponse(CamelModel):
    bookings: list[BookingResponse]
