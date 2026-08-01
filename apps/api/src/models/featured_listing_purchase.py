import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.config.database import Base
from src.models.enums import featured_purchase_status_enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.listing import Listing
    from src.models.user import User


class FeaturedListingPurchase(Base):
    __tablename__ = "featured_listing_purchases"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    purchased_by: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[float] = mapped_column(sa.Float, nullable=False)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="EUR")
    status: Mapped[str] = mapped_column(featured_purchase_status_enum, nullable=False, server_default="PENDING")
    starts_at: Mapped[sa.DateTime] = mapped_column(sa.TIMESTAMP, nullable=False)
    expires_at: Mapped[sa.DateTime] = mapped_column(sa.TIMESTAMP, nullable=False)
    payment_reference: Mapped[str | None] = mapped_column(sa.String(255))
    created_at: Mapped[sa.DateTime] = mapped_column(sa.TIMESTAMP, nullable=False, server_default=sa.func.now())

    listing: Mapped["Listing"] = relationship("Listing", back_populates="featured_purchases")
    purchaser: Mapped["User"] = relationship("User")

    __table_args__ = (
        sa.Index("featured_purchases_listing_id_idx", "listing_id"),
        sa.Index("featured_purchases_status_idx", "status"),
        sa.Index("featured_purchases_expires_at_idx", "expires_at"),
    )
