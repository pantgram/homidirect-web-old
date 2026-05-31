from datetime import datetime

from pydantic import model_validator

from src.schemas.base import CamelModel


class AvailabilitySlotResponse(CamelModel):
    id: int
    listing_id: int
    landlord_id: int
    start_time: datetime
    end_time: datetime
    is_booked: bool
    created_at: datetime


class CreateAvailabilitySlotRequest(CamelModel):
    listing_id: int
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def validate_times(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class UpdateAvailabilitySlotRequest(CamelModel):
    start_time: datetime | None = None
    end_time: datetime | None = None
    is_booked: bool | None = None

    @model_validator(mode="after")
    def validate_times(self):
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class SlotDetailResponse(CamelModel):
    slot: AvailabilitySlotResponse


class SlotsListResponse(CamelModel):
    slots: list[AvailabilitySlotResponse]
