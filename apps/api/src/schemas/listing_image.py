from datetime import datetime

from src.schemas.base import CamelModel


class ListingImageResponse(CamelModel):
    id: int
    url: str
    listing_id: int | None
    upload_session_id: str | None
    created_at: datetime


class PendingImageResponse(CamelModel):
    id: int
    url: str
    upload_session_id: str
    created_at: datetime


class ListingImagesResponse(CamelModel):
    images: list[ListingImageResponse]


class ListingImageDetailResponse(CamelModel):
    image: ListingImageResponse


class PendingImagesResponse(CamelModel):
    images: list[PendingImageResponse]


class UploadPendingImageResponse(CamelModel):
    image: PendingImageResponse
    upload_session_id: str
