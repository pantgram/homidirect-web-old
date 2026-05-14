from pydantic import BaseModel, model_validator
from datetime import datetime


class AvailabilitySlotResponse(BaseModel):
    id: int
    listing_id: int
    landlord_id: int
    start_time: datetime
    end_time: datetime
    is_booked: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CreateAvailabilitySlotRequest(BaseModel):
    listing_id: int
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def validate_times(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class UpdateAvailabilitySlotRequest(BaseModel):
    start_time: datetime | None = None
    end_time: datetime | None = None
    is_booked: bool | None = None

    @model_validator(mode="after")
    def validate_times(self):
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self
