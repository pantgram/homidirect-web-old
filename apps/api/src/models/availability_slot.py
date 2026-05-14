import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.config.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.listing import Listing
    from src.models.user import User
    from src.models.booking import Booking


class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    landlord_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    start_time: Mapped[sa.datetime] = mapped_column(sa.TIMESTAMP, nullable=False)
    end_time: Mapped[sa.datetime] = mapped_column(sa.TIMESTAMP, nullable=False)
    is_booked: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default="false")
    created_at: Mapped[sa.datetime] = mapped_column(sa.TIMESTAMP, nullable=False, server_default=sa.func.now())

    listing: Mapped["Listing"] = relationship("Listing", back_populates="availability_slots")
    landlord_user: Mapped["User"] = relationship("User")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="availability_slot")

    __table_args__ = (
        sa.Index("availability_slots_listing_id_idx", "listing_id"),
        sa.Index("availability_slots_landlord_id_idx", "landlord_id"),
        sa.Index("availability_slots_start_time_idx", "start_time"),
        sa.Index("availability_slots_is_booked_idx", "is_booked"),
    )
