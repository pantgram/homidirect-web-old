from datetime import datetime, timezone
from fastapi import BackgroundTasks
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.booking import Booking
from src.models.user import User
from src.models.listing import Listing
from src.utils.errors import ConflictError, NotFoundError
from src.utils.email import (
    send_booking_created_email,
    send_booking_confirmed_email,
    send_booking_declined_email,
    send_booking_cancelled_email,
)

VALID_TRANSITIONS = {
    "PENDING": ["CONFIRMED", "DECLINED", "CANCELLED"],
    "CONFIRMED": ["CANCELLED"],
    "DECLINED": [],
    "CANCELLED": [],
}


async def get_bookings_by_user(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(Booking).where(or_(Booking.candidate_id == user_id, Booking.landlord_id == user_id))
    )
    return result.scalars().all()


async def get_booking_by_id(db: AsyncSession, booking_id: int):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    return result.scalar_one_or_none()


async def create_booking(db: AsyncSession, data: dict, current_user, background_tasks: BackgroundTasks):
    from src.models.availability_slot import AvailabilitySlot

    listing_result = await db.execute(select(Listing).where(Listing.id == data["listing_id"]))
    listing = listing_result.scalar_one_or_none()
    if not listing:
        raise NotFoundError("Listing not found")

    if listing.landlord_id == current_user.id:
        raise ConflictError("Cannot book your own listing")

    if data.get("availability_slot_id"):
        slot_result = await db.execute(select(AvailabilitySlot).where(AvailabilitySlot.id == data["availability_slot_id"]))
        slot = slot_result.scalar_one_or_none()
        if not slot or slot.listing_id != data["listing_id"]:
            raise NotFoundError("Availability slot not found")
        if slot.is_booked:
            raise ConflictError("Availability slot is already booked")

    data["candidate_id"] = current_user.id
    data["landlord_id"] = listing.landlord_id

    booking = Booking(**data)
    db.add(booking)
    await db.flush()
    await db.refresh(booking)

    if booking.availability_slot_id:
        slot_result = await db.execute(select(AvailabilitySlot).where(AvailabilitySlot.id == booking.availability_slot_id))
        slot = slot_result.scalar_one_or_none()
        if slot:
            slot.is_booked = True

    try:
        tenant_r = await db.execute(select(User).where(User.id == booking.candidate_id))
        landlord_r = await db.execute(select(User).where(User.id == booking.landlord_id))
        tenant = tenant_r.scalar_one_or_none()
        landlord = landlord_r.scalar_one_or_none()

        if landlord and listing and tenant:
            background_tasks.add_task(
                send_booking_created_email,
                landlord.email,
                f"{landlord.first_name} {landlord.last_name}",
                f"{tenant.first_name} {tenant.last_name}",
                listing.title,
                listing.id,
                booking.scheduled_at.isoformat(),
                booking.id,
            )
    except Exception:
        pass

    return booking


async def update_booking(db: AsyncSession, booking_id: int, data: dict, background_tasks: BackgroundTasks):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        return None

    if data.get("status"):
        allowed = VALID_TRANSITIONS.get(booking.status, [])
        if data["status"] not in allowed:
            raise ConflictError(f"Cannot transition booking from {booking.status} to {data['status']}")

    for key, value in data.items():
        if value is not None:
            setattr(booking, key, value)
    await db.flush()
    await db.refresh(booking)

    try:
        tenant_r = await db.execute(select(User).where(User.id == booking.candidate_id))
        landlord_r = await db.execute(select(User).where(User.id == booking.landlord_id))
        listing_r = await db.execute(select(Listing).where(Listing.id == booking.listing_id))
        tenant = tenant_r.scalar_one_or_none()
        landlord = landlord_r.scalar_one_or_none()
        listing = listing_r.scalar_one_or_none()

        if tenant and landlord and listing:
            if booking.status == "CONFIRMED":
                background_tasks.add_task(
                    send_booking_confirmed_email,
                    tenant.email,
                    f"{tenant.first_name} {tenant.last_name}",
                    f"{landlord.first_name} {landlord.last_name}",
                    listing.title,
                    booking.scheduled_at.isoformat(),
                    booking.meet_link,
                )
            elif booking.status == "DECLINED":
                background_tasks.add_task(
                    send_booking_declined_email,
                    tenant.email,
                    f"{tenant.first_name} {tenant.last_name}",
                    f"{landlord.first_name} {landlord.last_name}",
                    listing.title,
                    booking.scheduled_at.isoformat(),
                )
    except Exception:
        pass

    return booking


async def delete_booking(db: AsyncSession, booking_id: int, background_tasks: BackgroundTasks) -> bool:
    from src.models.availability_slot import AvailabilitySlot

    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        return False

    try:
        if booking.availability_slot_id:
            slot_r = await db.execute(select(AvailabilitySlot).where(AvailabilitySlot.id == booking.availability_slot_id))
            slot = slot_r.scalar_one_or_none()
            if slot:
                slot.is_booked = False

        tenant_r = await db.execute(select(User).where(User.id == booking.candidate_id))
        landlord_r = await db.execute(select(User).where(User.id == booking.landlord_id))
        listing_r = await db.execute(select(Listing).where(Listing.id == booking.listing_id))
        tenant = tenant_r.scalar_one_or_none()
        landlord = landlord_r.scalar_one_or_none()
        listing = listing_r.scalar_one_or_none()

        if tenant and landlord and listing:
            background_tasks.add_task(
                send_booking_cancelled_email,
                landlord.email,
                f"{landlord.first_name} {landlord.last_name}",
                f"{tenant.first_name} {tenant.last_name}",
                listing.title,
                booking.scheduled_at.isoformat(),
            )
    except Exception:
        pass

    await db.delete(booking)
    return True
