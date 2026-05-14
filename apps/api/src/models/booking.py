import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.config.database import Base
from src.models.enums import booking_status_enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.user import User
    from src.models.listing import Listing
    from src.models.availability_slot import AvailabilitySlot


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    status: Mapped[str | None] = mapped_column(booking_status_enum, server_default="PENDING")
    scheduled_at: Mapped[sa.datetime] = mapped_column(sa.TIMESTAMP, nullable=False)
    meet_link: Mapped[str | None] = mapped_column(sa.String(255))
    created_at: Mapped[sa.datetime | None] = mapped_column(sa.TIMESTAMP, server_default=sa.func.now())
    candidate_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    landlord_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    availability_slot_id: Mapped[int | None] = mapped_column(sa.Integer, sa.ForeignKey("availability_slots.id", ondelete="SET NULL"))

    candidate: Mapped["User"] = relationship("User", foreign_keys=[candidate_id])
    landlord: Mapped["User"] = relationship("User", foreign_keys=[landlord_id])
    listing: Mapped["Listing"] = relationship("Listing", back_populates="bookings")
    availability_slot: Mapped["AvailabilitySlot | None"] = relationship("AvailabilitySlot", back_populates="bookings")

    __table_args__ = (
        sa.Index("bookings_candidate_id_idx", "candidate_id"),
        sa.Index("bookings_landlord_id_idx", "landlord_id"),
        sa.Index("bookings_listing_id_idx", "listing_id"),
        sa.Index("bookings_availability_slot_id_idx", "availability_slot_id"),
    )
