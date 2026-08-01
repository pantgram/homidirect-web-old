from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.config.database import Base
from src.models.enums import auth_provider_enum, user_role_enum, user_status_enum

if TYPE_CHECKING:
    from src.models.interested_listing import InterestedListing
    from src.models.listing import Listing


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    first_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    role: Mapped[str] = mapped_column(user_role_enum, nullable=False)
    status: Mapped[str] = mapped_column(user_status_enum, nullable=False, server_default="ACTIVE")
    email: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True)
    password: Mapped[str | None] = mapped_column(sa.Text)
    google_id: Mapped[str | None] = mapped_column(sa.String(255), unique=True)
    auth_provider: Mapped[str] = mapped_column(auth_provider_enum, nullable=False, server_default="EMAIL")
    email_verified: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default="false")
    password_reset_token: Mapped[str | None] = mapped_column(sa.String(255))
    password_reset_expires: Mapped[sa.TIMESTAMP | None] = mapped_column(sa.TIMESTAMP)
    token_version: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default="0")
    created_at: Mapped[sa.DateTime] = mapped_column(sa.TIMESTAMP, nullable=False, server_default=sa.func.now())
    updated_at: Mapped[sa.DateTime] = mapped_column(sa.TIMESTAMP, nullable=False, server_default=sa.func.now(), onupdate=sa.func.now())

    listings: Mapped[list["Listing"]] = relationship("Listing", foreign_keys="[Listing.landlord_id]", back_populates="landlord")
    verified_listings: Mapped[list["Listing"]] = relationship("Listing", foreign_keys="[Listing.verified_by]", back_populates="verified_by_user")
    interested_listings: Mapped[list["InterestedListing"]] = relationship("InterestedListing", back_populates="user")
