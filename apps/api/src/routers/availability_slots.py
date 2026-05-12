from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.dependencies.auth import require_role, get_current_user
from src.models.user import User
from src.services import availability_slot as slot_service
from src.schemas.availability_slot import CreateAvailabilitySlotRequest, UpdateAvailabilitySlotRequest

router = APIRouter(prefix="/availability-slots", tags=["Availability Slots"])


@router.get("/listing/{listing_id}/available")
async def get_available_slots(listing_id: int, db: AsyncSession = Depends(get_db)):
    slots = await slot_service.get_available_slots(db, listing_id)
    return {"slots": [_format_slot(s) for s in slots]}


@router.get("/listing/{listing_id}")
async def get_slots_by_listing(listing_id: int, db: AsyncSession = Depends(get_db)):
    slots = await slot_service.get_slots_by_listing(db, listing_id)
    return {"slots": [_format_slot(s) for s in slots]}


@router.get("/{slot_id}")
async def get_slot(slot_id: int, db: AsyncSession = Depends(get_db)):
    slot = await slot_service.get_slot_by_id(db, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    return _format_slot(slot)


@router.post("/", status_code=201)
async def create_slot(
    body: CreateAvailabilitySlotRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH", "ADMIN")),
):
    data = {"listing_id": body.listing_id, "start_time": body.start_time, "end_time": body.end_time}
    slot = await slot_service.create_slot(db, data, current_user)
    return _format_slot(slot)


@router.patch("/{slot_id}")
async def update_slot(
    slot_id: int,
    body: UpdateAvailabilitySlotRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH", "ADMIN")),
):
    data = body.model_dump(exclude_none=True)
    slot = await slot_service.update_slot(db, slot_id, data, current_user)
    return _format_slot(slot)


@router.delete("/{slot_id}", status_code=204)
async def delete_slot(
    slot_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH", "ADMIN")),
):
    await slot_service.delete_slot(db, slot_id, current_user)


def _format_slot(s):
    return {
        "id": s.id, "listingId": s.listing_id, "landlordId": s.landlord_id,
        "startTime": s.start_time.isoformat(), "endTime": s.end_time.isoformat(),
        "isBooked": s.is_booked, "createdAt": s.created_at.isoformat(),
    }
