from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.dependencies.auth import get_current_user, get_optional_user, require_role, verify_listing_ownership
from src.models.user import User
from src.models.user import User as UserModel
from src.schemas.common import MessageResponse
from src.schemas.listing import (
    ContactOwnerRequest,
    CreateListingRequest,
    ListingDetailResponse,
    ListingListResponse,
    ListingStatsResponse,
    PaginatedListingSearchResponse,
    UpdateListingRequest,
)
from src.services import listing as listing_service
from src.utils.email import send_contact_owner_email
from src.utils.serializers import listing_to_dict

router = APIRouter(prefix="/listings", tags=["Listings"])


@router.get("/stats", response_model=ListingStatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db)):
    return await listing_service.get_stats(db)


@router.get("/search", response_model=PaginatedListingSearchResponse)
async def search_listings(
    q: str | None = None,
    property_type: str | None = None,
    city: str | None = None,
    region: str | None = None,
    country: str | None = None,
    floor: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_bedrooms: int | None = None,
    max_bedrooms: int | None = None,
    min_bathrooms: int | None = None,
    max_bathrooms: int | None = None,
    min_area: float | None = None,
    max_area: float | None = None,
    min_kitchens: int | None = None,
    max_kitchens: int | None = None,
    min_levels: int | None = None,
    max_levels: int | None = None,
    elevator: bool | None = None,
    parking_space: bool | None = None,
    furnished: bool | None = None,
    zone_type: str | None = None,
    listing_status: str | None = None,
    date_available_from: str | None = None,
    date_available_to: str | None = None,
    min_date_built: int | None = None,
    max_date_built: int | None = None,
    available: bool | None = None,
    is_featured: bool | None = None,
    verification_status: str | None = None,
    sort_by: str = "featured",
    page: int = 1,
    limit: int = 15,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    params = {k: v for k, v in locals().items() if k not in ("db", "current_user") and v is not None}
    return await listing_service.search_listings(db, params, is_authenticated=current_user is not None)


@router.get("/cities", response_model=list[str])
async def get_cities(db: AsyncSession = Depends(get_db)):
    return await listing_service.get_distinct_cities(db)


@router.get("/my-listings", response_model=PaginatedListingSearchResponse)
async def get_my_listings(
    page: int = 1, limit: int = 15,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    return await listing_service.get_listings_by_landlord(db, current_user.id, page, limit)


@router.get("/", response_model=ListingListResponse)
async def get_all_listings(db: AsyncSession = Depends(get_db)):
    listings = await listing_service.get_all_listings(db)
    return {"listings": [listing_to_dict(l) for l in listings]}


@router.get("/{listing_id}", response_model=ListingDetailResponse)
async def get_listing(listing_id: int, db: AsyncSession = Depends(get_db)):
    listing = await listing_service.get_listing_by_id(db, listing_id)
    return {"listing": listing_to_dict(listing)}


@router.post("/", status_code=201, response_model=ListingDetailResponse)
async def create_listing(
    body: CreateListingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    if current_user.role != "ADMIN":
        body.landlord_id = current_user.id
    data = body.model_dump(exclude={"upload_session_id"}, exclude_none=True)
    upload_session_id = body.upload_session_id
    listing = await listing_service.create_listing(db, data, upload_session_id)
    return {"listing": listing_to_dict(listing)}


@router.patch("/{listing_id}", response_model=ListingDetailResponse)
async def update_listing(
    listing_id: int,
    body: UpdateListingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    await verify_listing_ownership(listing_id, db, current_user)
    data = body.model_dump(exclude_none=True)
    listing = await listing_service.update_listing(db, listing_id, data)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"listing": listing_to_dict(listing)}


@router.delete("/{listing_id}", status_code=204)
async def delete_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    await verify_listing_ownership(listing_id, db, current_user)
    deleted = await listing_service.delete_listing(db, listing_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Listing not found")


@router.post("/{listing_id}/contact", response_model=MessageResponse)
async def contact_owner(
    listing_id: int,
    body: ContactOwnerRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = await listing_service.get_listing_by_id(db, listing_id)
    landlord_r = await db.execute(select(UserModel).where(UserModel.id == listing.landlord_id))
    landlord = landlord_r.scalar_one_or_none()
    if landlord:
        background_tasks.add_task(
            send_contact_owner_email,
            landlord.email,
            body.name,
            body.email,
            body.phone or "",
            body.message,
        )
    return {"message": "Contact email sent"}
