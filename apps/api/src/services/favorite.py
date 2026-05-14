from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.interested_listing import InterestedListing
from src.models.listing import Listing
from src.utils.errors import NotFoundError
from src.utils.serializers import get_primary_images, listing_to_dict


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
    img_map = await get_primary_images(db, listing_ids)

    items = []
    for l in listings:
        d = listing_to_dict(l)
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
