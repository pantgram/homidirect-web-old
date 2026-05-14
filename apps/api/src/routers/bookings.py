from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.dependencies.auth import get_current_user, verify_booking_ownership
from src.models.user import User
from src.services import booking as booking_service
from src.schemas.booking import CreateBookingRequest, UpdateBookingRequest

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("/")
async def get_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = await booking_service.get_bookings_by_user(db, current_user.id)
    return {"bookings": [
        {
            "id": b.id, "status": b.status, "scheduledAt": b.scheduled_at.isoformat(),
            "meetLink": b.meet_link, "createdAt": b.created_at.isoformat() if b.created_at else None,
            "candidateId": b.candidate_id, "landlordId": b.landlord_id,
            "listingId": b.listing_id, "availabilitySlotId": b.availability_slot_id,
        }
        for b in bookings
    ]}


@router.get("/{booking_id}")
async def get_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await verify_booking_ownership(booking_id, db, current_user)
    b = await booking_service.get_booking_by_id(db, booking_id)
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"booking": {
        "id": b.id, "status": b.status, "scheduledAt": b.scheduled_at.isoformat(),
        "meetLink": b.meet_link, "createdAt": b.created_at.isoformat() if b.created_at else None,
        "candidateId": b.candidate_id, "landlordId": b.landlord_id,
        "listingId": b.listing_id, "availabilitySlotId": b.availability_slot_id,
    }}


@router.post("/", status_code=201)
async def create_booking(
    body: CreateBookingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = body.model_dump(exclude_none=True)
    b = await booking_service.create_booking(db, data, current_user)
    return {"booking": {
        "id": b.id, "status": b.status, "scheduledAt": b.scheduled_at.isoformat(),
        "meetLink": b.meet_link, "createdAt": b.created_at.isoformat() if b.created_at else None,
        "candidateId": b.candidate_id, "landlordId": b.landlord_id,
        "listingId": b.listing_id, "availabilitySlotId": b.availability_slot_id,
    }}


@router.patch("/{booking_id}")
async def update_booking(
    booking_id: int,
    body: UpdateBookingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await verify_booking_ownership(booking_id, db, current_user)
    data = body.model_dump(exclude_none=True)
    b = await booking_service.update_booking(db, booking_id, data)
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"booking": {
        "id": b.id, "status": b.status, "scheduledAt": b.scheduled_at.isoformat(),
        "meetLink": b.meet_link, "createdAt": b.created_at.isoformat() if b.created_at else None,
        "candidateId": b.candidate_id, "landlordId": b.landlord_id,
        "listingId": b.listing_id, "availabilitySlotId": b.availability_slot_id,
    }}


@router.delete("/{booking_id}", status_code=204)
async def delete_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await verify_booking_ownership(booking_id, db, current_user)
    deleted = await booking_service.delete_booking(db, booking_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Booking not found")
