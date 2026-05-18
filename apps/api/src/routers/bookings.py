from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.dependencies.auth import get_current_user, verify_booking_ownership
from src.models.user import User
from src.services import booking as booking_service
from src.schemas.booking import CreateBookingRequest, UpdateBookingRequest

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def _format_booking(b):
    return {
        "id": b.id,
        "status": b.status,
        "scheduled_at": b.scheduled_at.isoformat(),
        "meet_link": b.meet_link,
        "created_at": b.created_at.isoformat() if b.created_at else None,
        "candidate_id": b.candidate_id,
        "landlord_id": b.landlord_id,
        "listing_id": b.listing_id,
        "availability_slot_id": b.availability_slot_id,
    }


@router.get("/")
async def get_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = await booking_service.get_bookings_by_user(db, current_user.id)
    return {"bookings": [_format_booking(b) for b in bookings]}


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
    return {"booking": _format_booking(b)}


@router.post("/", status_code=201)
async def create_booking(
    body: CreateBookingRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = body.model_dump(exclude_none=True)
    b = await booking_service.create_booking(db, data, current_user, background_tasks)
    return {"booking": _format_booking(b)}


@router.patch("/{booking_id}")
async def update_booking(
    booking_id: int,
    body: UpdateBookingRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await verify_booking_ownership(booking_id, db, current_user)
    data = body.model_dump(exclude_none=True)
    b = await booking_service.update_booking(db, booking_id, data, background_tasks)
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"booking": _format_booking(b)}


@router.get("/listing/{listing_id}")
async def get_bookings_by_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bookings = await booking_service.get_bookings_by_listing(db, listing_id)
    return {"bookings": [_format_booking(b) for b in bookings]}


@router.delete("/{booking_id}", status_code=204)
async def delete_booking(
    booking_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await verify_booking_ownership(booking_id, db, current_user)
    deleted = await booking_service.delete_booking(db, booking_id, background_tasks)
    if not deleted:
        raise HTTPException(status_code=404, detail="Booking not found")
