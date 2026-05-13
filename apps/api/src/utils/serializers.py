from sqlalchemy import asc, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.listing import Listing
from src.models.listing_image import ListingImage


async def get_primary_images(db: AsyncSession, listing_ids: list[int]) -> dict:
    if not listing_ids:
        return {}
    result = await db.execute(
        select(ListingImage).where(ListingImage.listing_id.in_(listing_ids)).order_by(asc(ListingImage.created_at))
    )
    images = result.scalars().all()
    img_map = {}
    for img in images:
        if img.listing_id and img.listing_id not in img_map:
            img_map[img.listing_id] = {
                "id": img.id,
                "url": img.url,
                "listing_id": img.listing_id,
                "created_at": img.created_at.isoformat(),
            }
    return img_map


def listing_to_dict(listing: Listing) -> dict:
    return {
        "id": listing.id,
        "title": listing.title,
        "description": listing.description,
        "price": listing.price,
        "city": listing.city,
        "postal_code": listing.postal_code,
        "floor": listing.floor,
        "levels": listing.levels,
        "kitchens": listing.kitchens,
        "bedrooms": listing.bedrooms,
        "bathrooms": listing.bathrooms,
        "area": listing.area,
        "elevator": listing.elevator,
        "parking_space": listing.parking_space,
        "furnished": listing.furnished,
        "zone_type": listing.zone_type,
        "listing_status": listing.listing_status,
        "date_available": listing.date_available.isoformat() if listing.date_available else None,
        "date_built": listing.date_built,
        "views_count": listing.views_count,
        "country": listing.country,
        "address": listing.address,
        "latitude": listing.latitude,
        "longitude": listing.longitude,
        "property_type": listing.property_type,
        "available": listing.available,
        "created_at": listing.created_at.isoformat() if listing.created_at else None,
        "updated_at": listing.updated_at.isoformat() if listing.updated_at else None,
        "landlord_id": listing.landlord_id,
        "landlord_phone": listing.landlord_phone,
        "verification_status": listing.verification_status,
        "verified_at": listing.verified_at.isoformat() if listing.verified_at else None,
        "verified_by": listing.verified_by,
        "is_featured": listing.is_featured,
        "featured_until": listing.featured_until.isoformat() if listing.featured_until else None,
        "title_el": listing.title_el,
        "title_en": listing.title_en,
        "description_el": listing.description_el,
        "description_en": listing.description_en,
    }
