from datetime import date, datetime

from src.schemas.base import CamelModel


class ListingImageBasic(CamelModel):
    id: int
    url: str
    listing_id: int | None
    created_at: datetime


class ListingResponse(CamelModel):
    id: int
    title: str
    description: str
    price: float
    city: str
    postal_code: str | None
    floor: str
    levels: int
    kitchens: int
    bedrooms: int
    bathrooms: int
    area: float
    elevator: bool
    parking_space: bool
    furnished: bool
    zone_type: str
    listing_status: str | None
    date_available: date
    date_built: int
    views_count: int
    country: str | None
    address: str | None
    latitude: float | None
    longitude: float | None
    property_type: str
    available: bool
    created_at: datetime
    updated_at: datetime
    landlord_id: int
    landlord_phone: str | None
    verification_status: str
    verified_at: datetime | None
    verified_by: int | None
    is_featured: bool
    featured_until: datetime | None
    title_el: str
    title_en: str | None
    description_el: str
    description_en: str | None


class ListingSearchResponse(ListingResponse):
    primary_image: ListingImageBasic | None = None


class CreateListingRequest(CamelModel):
    title: str
    description: str | None = None
    price: float
    city: str
    postal_code: str | None = None
    floor: str | None = None
    levels: int | None = None
    kitchens: int | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    area: float | None = None
    elevator: bool | None = None
    parking_space: bool | None = None
    furnished: bool | None = None
    zone_type: str | None = None
    listing_status: str | None = None
    date_available: date | None = None
    date_built: int | None = None
    country: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    property_type: str
    available: bool | None = None
    landlord_id: int
    landlord_phone: str | None = None
    upload_session_id: str | None = None
    title_el: str | None = None
    title_en: str | None = None
    description_el: str | None = None
    description_en: str | None = None


class UpdateListingRequest(CamelModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    city: str | None = None
    postal_code: str | None = None
    floor: str | None = None
    levels: int | None = None
    kitchens: int | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    area: float | None = None
    elevator: bool | None = None
    parking_space: bool | None = None
    furnished: bool | None = None
    zone_type: str | None = None
    listing_status: str | None = None
    date_available: date | None = None
    date_built: int | None = None
    country: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    property_type: str | None = None
    available: bool | None = None
    landlord_phone: str | None = None
    title_el: str | None = None
    title_en: str | None = None
    description_el: str | None = None
    description_en: str | None = None


class SearchListingsParams(CamelModel):
    q: str | None = None
    property_type: str | None = None
    city: str | None = None
    region: str | None = None
    country: str | None = None
    floor: str | None = None
    min_price: float | None = None
    max_price: float | None = None
    min_bedrooms: int | None = None
    max_bedrooms: int | None = None
    min_bathrooms: int | None = None
    max_bathrooms: int | None = None
    min_area: float | None = None
    max_area: float | None = None
    min_kitchens: int | None = None
    max_kitchens: int | None = None
    min_levels: int | None = None
    max_levels: int | None = None
    elevator: bool | None = None
    parking_space: bool | None = None
    furnished: bool | None = None
    zone_type: str | None = None
    listing_status: str | None = None
    date_available_from: str | None = None
    date_available_to: str | None = None
    min_date_built: int | None = None
    max_date_built: int | None = None
    available: bool | None = None
    is_featured: bool | None = None
    verification_status: str | None = None
    sort_by: str = "featured"
    page: int = 1
    limit: int = 15


class ContactOwnerRequest(CamelModel):
    name: str
    email: str
    phone: str | None = None
    message: str


class ListingStatsResponse(CamelModel):
    active_listings_count: int
    property_owners_count: int


class ListingIdParam(CamelModel):
    listing_id: int
