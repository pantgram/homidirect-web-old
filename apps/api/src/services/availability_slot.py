from datetime import datetime, timezone
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.availability_slot import AvailabilitySlot
from src.models.listing import Listing
from src.utils.errors import NotFoundError, ForbiddenError


async def get_slots_by_listing(db: AsyncSession, listing_id: int):
    result = await db.execute(
        select(AvailabilitySlot).where(AvailabilitySlot.listing_id == listing_id).order_by(AvailabilitySlot.start_time)
    )
    return result.scalars().all()


async def get_available_slots(db: AsyncSession, listing_id: int):
    result = await db.execute(
        select(AvailabilitySlot).where(
            AvailabilitySlot.listing_id == listing_id,
            AvailabilitySlot.is_booked == False,
            AvailabilitySlot.start_time >= datetime.now(timezone.utc),
        ).order_by(AvailabilitySlot.start_time)
    )
    return result.scalars().all()


async def get_slot_by_id(db: AsyncSession, slot_id: int):
    result = await db.execute(select(AvailabilitySlot).where(AvailabilitySlot.id == slot_id))
    return result.scalar_one_or_none()


async def create_slot(db: AsyncSession, data: dict, current_user):
    listing_r = await db.execute(select(Listing).where(Listing.id == data["listing_id"]))
    listing = listing_r.scalar_one_or_none()
    if not listing:
        raise NotFoundError("Listing not found")
    if current_user.role != "ADMIN" and listing.landlord_id != current_user.id:
        raise ForbiddenError("You do not own this listing")

    data["landlord_id"] = current_user.id
    slot = AvailabilitySlot(**data)
    db.add(slot)
    await db.flush()
    await db.refresh(slot)
    return slot


async def update_slot(db: AsyncSession, slot_id: int, data: dict, current_user):
    slot = await get_slot_by_id(db, slot_id)
    if not slot:
        raise NotFoundError("Availability slot not found")
    if current_user.role != "ADMIN" and slot.landlord_id != current_user.id:
        raise ForbiddenError("You do not own this slot")

    for key, value in data.items():
        if value is not None:
            setattr(slot, key, value)
    await db.flush()
    await db.refresh(slot)
    return slot


async def delete_slot(db: AsyncSession, slot_id: int, current_user) -> bool:
    slot = await get_slot_by_id(db, slot_id)
    if not slot:
        raise NotFoundError("Availability slot not found")
    if current_user.role != "ADMIN" and slot.landlord_id != current_user.id:
        raise ForbiddenError("You do not own this slot")
    await db.delete(slot)
    return True
