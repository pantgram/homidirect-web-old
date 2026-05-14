import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.config.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.user import User
    from src.models.listing import Listing


class InterestedListing(Base):
    __tablename__ = "interested_listings"

    user_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    listing_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)

    user: Mapped["User"] = relationship("User", back_populates="interested_listings")
    listing: Mapped["Listing"] = relationship("Listing", back_populates="interested_users")
