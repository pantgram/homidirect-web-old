from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.interested_listing import InterestedListing
from src.models.listing import Listing
from src.models.listing_image import ListingImage
from src.utils.errors import NotFoundError


async def get_favorites(db: AsyncSession, user_id: int, page: int = 1, limit: int = 15):
    offset = (page - 1) * limit

    count_r = await db.execute(
        select(func.count()).select_from(InterestedListing).where(InterestedListing.user_id == user_id)
    )
    total = count_r.scalar() or 0

    result = await db.execute(
        select(Listing)
        .join(InterestedListing, InterestedListing.listing_id == Listing.id)
        .where(InterestedListing.user_id == user_id)
        .order_by(desc(Listing.created_at))
        .limit(limit)
        .offset(offset)
    )
    listings = result.scalars().all()

    listing_ids = [l.id for l in listings]
    img_map = await _get_primary_images(db, listing_ids)

    items = []
    for l in listings:
        d = _to_dict(l)
        d["primary_image"] = img_map.get(l.id)
        items.append(d)

    total_pages = (total + limit - 1) // limit
    return {
        "data": items,
        "pagination": {
            "page": page, "limit": limit, "total": total,
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1,
        },
    }


async def get_favorite_ids(db: AsyncSession, user_id: int) -> list[int]:
    result = await db.execute(select(InterestedListing.listing_id).where(InterestedListing.user_id == user_id))
    return [r[0] for r in result.all()]


async def check_favorite(db: AsyncSession, user_id: int, listing_id: int) -> bool:
    result = await db.execute(
        select(InterestedListing).where(InterestedListing.user_id == user_id, InterestedListing.listing_id == listing_id)
    )
    return result.scalar_one_or_none() is not None


async def add_favorite(db: AsyncSession, user_id: int, listing_id: int) -> bool:
    listing_r = await db.execute(select(Listing).where(Listing.id == listing_id))
    if not listing_r.scalar_one_or_none():
        raise NotFoundError("Listing not found")

    existing = await db.execute(
        select(InterestedListing).where(InterestedListing.user_id == user_id, InterestedListing.listing_id == listing_id)
    )
    if existing.scalar_one_or_none():
        return False

    fav = InterestedListing(user_id=user_id, listing_id=listing_id)
    db.add(fav)
    await db.flush()
    return True


async def remove_favorite(db: AsyncSession, user_id: int, listing_id: int) -> bool:
    result = await db.execute(
        select(InterestedListing).where(InterestedListing.user_id == user_id, InterestedListing.listing_id == listing_id)
    )
    fav = result.scalar_one_or_none()
    if not fav:
        raise NotFoundError("Favorite not found")
    await db.delete(fav)
    return True


async def _get_primary_images(db: AsyncSession, listing_ids: list[int]) -> dict:
    if not listing_ids:
        return {}
    result = await db.execute(
        select(ListingImage).where(ListingImage.listing_id.in_(listing_ids)).order_by(ListingImage.created_at)
    )
    images = result.scalars().all()
    img_map = {}
    for img in images:
        if img.listing_id and img.listing_id not in img_map:
            img_map[img.listing_id] = {"id": img.id, "url": img.url, "listing_id": img.listing_id, "created_at": img.created_at.isoformat()}
    return img_map


def _to_dict(listing: Listing) -> dict:
    return {
        "id": listing.id, "title": listing.title, "description": listing.description,
        "price": listing.price, "city": listing.city, "postal_code": listing.postal_code,
        "floor": listing.floor, "levels": listing.levels, "kitchens": listing.kitchens,
        "bedrooms": listing.bedrooms, "bathrooms": listing.bathrooms, "area": listing.area,
        "elevator": listing.elevator, "parking_space": listing.parking_space,
        "furnished": listing.furnished, "zone_type": listing.zone_type,
        "listing_status": listing.listing_status,
        "date_available": listing.date_available.isoformat() if listing.date_available else None,
        "date_built": listing.date_built, "views_count": listing.views_count,
        "country": listing.country, "address": listing.address,
        "latitude": listing.latitude, "longitude": listing.longitude,
        "property_type": listing.property_type, "available": listing.available,
        "created_at": listing.created_at.isoformat() if listing.created_at else None,
        "updated_at": listing.updated_at.isoformat() if listing.updated_at else None,
        "landlord_id": listing.landlord_id, "landlord_phone": listing.landlord_phone,
        "verification_status": listing.verification_status,
        "verified_at": listing.verified_at.isoformat() if listing.verified_at else None,
        "verified_by": listing.verified_by,
        "is_featured": listing.is_featured,
        "featured_until": listing.featured_until.isoformat() if listing.featured_until else None,
        "title_el": listing.title_el, "title_en": listing.title_en,
        "description_el": listing.description_el, "description_en": listing.description_en,
    }
