

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
if TYPE_CHECKING:

    from src.models.availability_slot import AvailabilitySlot
    from src.models.booking import Booking
    from src.models.conversation import Conversation
    from src.models.featured_listing_purchase import FeaturedListingPurchase
    from src.models.interested_listing import InterestedListing
    from src.models.listing_image import ListingImage
    from src.models.user import User
    from src.models.verification_document import VerificationDocument
    from src.models.verification_history import VerificationHistory
from src.config.database import Base
from src.models.enums import (
    floors_enum,
    listing_status_enum,
    property_type_enum,
    verification_status_enum,
    zone_type_enum,
)



class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    description: Mapped[str] = mapped_column(sa.Text, nullable=False)
    title: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    price: Mapped[float] = mapped_column(sa.Float, nullable=False)
    city: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    postal_code: Mapped[str | None] = mapped_column(sa.String(50))
    floor: Mapped[str] = mapped_column(floors_enum, nullable=False, server_default="ground")
    levels: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default="1")
    kitchens: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default="1")
    bedrooms: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default="1")
    bathrooms: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default="1")
    area: Mapped[float] = mapped_column(sa.Float, nullable=False)
    elevator: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default="false")
    parking_space: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default="false")
    furnished: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default="false")
    zone_type: Mapped[str] = mapped_column(zone_type_enum, nullable=False, server_default="Residential")
    listing_status: Mapped[str | None] = mapped_column(listing_status_enum)
    date_available: Mapped[sa.date] = mapped_column(sa.Date, nullable=False, server_default=sa.func.now())
    date_built: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER"))
    views_count: Mapped[int] = mapped_column("views_count", sa.Integer, nullable=False, server_default="0")
    country: Mapped[str | None] = mapped_column(sa.String(255), server_default="Greece")
    address: Mapped[str | None] = mapped_column(sa.String(500))
    latitude: Mapped[float | None] = mapped_column(sa.Float)
    longitude: Mapped[float | None] = mapped_column(sa.Float)
    property_type: Mapped[str] = mapped_column(property_type_enum, nullable=False)
    available: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default="true")
    created_at: Mapped[sa.datetime] = mapped_column(sa.TIMESTAMP, nullable=False, server_default=sa.func.now())
    updated_at: Mapped[sa.datetime] = mapped_column(sa.TIMESTAMP, nullable=False, server_default=sa.func.now(), onupdate=sa.func.now())
    landlord_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    landlord_phone: Mapped[str | None] = mapped_column(sa.String(20))
    verification_status: Mapped[str] = mapped_column(verification_status_enum, nullable=False, server_default="PENDING")
    verified_at: Mapped[sa.datetime | None] = mapped_column(sa.TIMESTAMP)
    verified_by: Mapped[int | None] = mapped_column(sa.Integer, sa.ForeignKey("users.id", ondelete="SET NULL"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default="false")
    featured_until: Mapped[sa.datetime | None] = mapped_column(sa.TIMESTAMP)
    title_el: Mapped[str] = mapped_column(sa.String(100), nullable=False, server_default="")
    title_en: Mapped[str | None] = mapped_column(sa.String(100))
    description_el: Mapped[str] = mapped_column(sa.Text, nullable=False, server_default="")
    description_en: Mapped[str | None] = mapped_column(sa.Text)

    landlord: Mapped["User"] = relationship("User", foreign_keys=[landlord_id], back_populates="listings")
    verified_by_user: Mapped["User | None"] = relationship("User", foreign_keys=[verified_by], back_populates="verified_listings")
    images: Mapped[list["ListingImage"]] = relationship("ListingImage", back_populates="listing")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="listing")
    interested_users: Mapped[list["InterestedListing"]] = relationship("InterestedListing", back_populates="listing")
    availability_slots: Mapped[list["AvailabilitySlot"]] = relationship("AvailabilitySlot", back_populates="listing")
    conversations: Mapped[list["Conversation"]] = relationship("Conversation", back_populates="listing")
    verification_documents: Mapped[list["VerificationDocument"]] = relationship("VerificationDocument", back_populates="listing")
    verification_history_entries: Mapped[list["VerificationHistory"]] = relationship("VerificationHistory", back_populates="listing")
    featured_purchases: Mapped[list["FeaturedListingPurchase"]] = relationship("FeaturedListingPurchase", back_populates="listing")

    __table_args__ = (
        sa.CheckConstraint("price >= 0", name="price"),
        sa.CheckConstraint("levels >= 0", name="levels"),
        sa.CheckConstraint("kitchens >= 0", name="kitchens"),
        sa.CheckConstraint("bedrooms >= 0", name="bedrooms"),
        sa.CheckConstraint("bathrooms >= 0", name="bathrooms"),
        sa.CheckConstraint("area >= 0", name="area"),
        sa.CheckConstraint("views_count >= 0", name="views_count"),
        sa.Index("listings_verification_status_idx", "verification_status"),
        sa.Index("listings_is_featured_idx", "is_featured"),
        sa.Index("listings_featured_until_idx", "featured_until"),
        sa.Index("listings_city_idx", "city"),
        sa.Index("listings_landlord_id_idx", "landlord_id"),
        sa.Index("listings_property_type_idx", "property_type"),
        sa.Index("listings_price_idx", "price"),
        sa.Index("listings_bedrooms_idx", "bedrooms"),
        sa.Index("listings_bathrooms_idx", "bathrooms"),
        sa.Index("listings_area_idx", "area"),
        sa.Index("listings_available_idx", "available"),
        sa.Index("listings_created_at_idx", "created_at"),
        sa.Index("listings_country_idx", "country"),
        sa.Index("listings_available_featured_idx", "available", "is_featured"),
        sa.Index("listings_city_price_idx", "city", "price"),
        sa.Index("listings_type_city_idx", "property_type", "city"),
        sa.Index("listings_search_en_idx", sa.text("to_tsvector('english', coalesce(title_en, '') || ' ' || coalesce(description, ''))"), postgresql_using="gin"),
        sa.Index("listings_search_el_idx", sa.text("to_tsvector('greek', coalesce(title_el, '') || ' ' || coalesce(description, ''))"), postgresql_using="gin"),
    )
