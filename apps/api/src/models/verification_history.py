import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.config.database import Base
from src.models.enums import verification_status_enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.listing import Listing
    from src.models.user import User


class VerificationHistory(Base):
    __tablename__ = "verification_history"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    previous_status: Mapped[str | None] = mapped_column(verification_status_enum)
    new_status: Mapped[str] = mapped_column(verification_status_enum, nullable=False)
    notes: Mapped[str | None] = mapped_column(sa.Text)
    reviewed_by: Mapped[int | None] = mapped_column(sa.Integer, sa.ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[sa.datetime] = mapped_column(sa.TIMESTAMP, nullable=False, server_default=sa.func.now())

    listing: Mapped["Listing"] = relationship("Listing", back_populates="verification_history_entries")
    reviewer: Mapped["User | None"] = relationship("User")

    __table_args__ = (
        sa.Index("verification_history_listing_id_idx", "listing_id"),
    )
