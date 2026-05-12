from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.config.database import get_db
from src.dependencies.auth import get_current_user, require_role, verify_listing_ownership, get_optional_user
from src.models.user import User
from src.services import listing as listing_service
from src.schemas.listing import CreateListingRequest, UpdateListingRequest, ContactOwnerRequest
from src.utils.email import send_contact_owner_email
from src.utils.errors import AppError

router = APIRouter(prefix="/listings", tags=["Listings"])


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    return await listing_service.get_stats(db)


@router.get("/search")
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


@router.get("/cities")
async def get_cities(db: AsyncSession = Depends(get_db)):
    return await listing_service.get_distinct_cities(db)


@router.get("/my-listings")
async def get_my_listings(
    page: int = 1, limit: int = 15,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    return await listing_service.get_listings_by_landlord(db, current_user.id, page, limit)


@router.get("/")
async def get_all_listings(db: AsyncSession = Depends(get_db)):
    listings = await listing_service.get_all_listings(db)
    return {"listings": [listing_service._listing_to_dict(l) for l in listings]}


@router.get("/{listing_id}")
async def get_listing(listing_id: int, db: AsyncSession = Depends(get_db)):
    listing = await listing_service.get_listing_by_id(db, listing_id)
    return {"listing": listing_service._listing_to_dict(listing)}


@router.post("/", status_code=201)
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
    return {"listing": listing_service._listing_to_dict(listing)}


@router.patch("/{listing_id}")
async def update_listing(
    listing_id: int,
    body: UpdateListingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    from src.dependencies.auth import verify_listing_ownership as vlo
    await vlo(listing_id, db, current_user)
    data = body.model_dump(exclude_none=True)
    listing = await listing_service.update_listing(db, listing_id, data)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"listing": listing_service._listing_to_dict(listing)}


@router.delete("/{listing_id}", status_code=204)
async def delete_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("LANDLORD", "BOTH")),
):
    from src.dependencies.auth import verify_listing_ownership as vlo
    await vlo(listing_id, db, current_user)
    deleted = await listing_service.delete_listing(db, listing_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Listing not found")


@router.post("/{listing_id}/contact")
async def contact_owner(
    listing_id: int,
    body: ContactOwnerRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("TENANT", "BOTH")),
):
    listing = await listing_service.get_listing_by_id(db, listing_id)
    from src.models.user import User as UserModel
    from sqlalchemy import select
    landlord_r = await db.execute(select(UserModel).where(UserModel.id == listing.landlord_id))
    landlord = landlord_r.scalar_one_or_none()
    if landlord:
        send_contact_owner_email.delay(
            owner_email=landlord.email,
            sender_name=body.name,
            sender_email=body.email,
            sender_phone=body.phone,
            message=body.message,
        )
    return {"message": "Contact email sent"}
