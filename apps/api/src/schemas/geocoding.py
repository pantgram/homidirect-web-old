from pydantic import BaseModel, ConfigDict

from src.schemas.base import CamelModel


class GeocodingSearchResult(CamelModel):
    place_id: str | None
    formatted: str
    address: str
    city: str
    municipality: str
    country: str
    suburb: str
    neighbourhood: str
    quarter: str
    postal_code: str
    result_type: str
    lat: float
    lon: float


class GeocodingSearchResponse(CamelModel):
    results: list[GeocodingSearchResult]


class GeocodingReverseResult(CamelModel):
    address: str
    city: str
    municipality: str
    country: str
    suburb: str
    postal_code: str
    lat: float
    lon: float


class GeocodingReverseResponse(CamelModel):
    result: GeocodingReverseResult | None


class AddressGeometryLocation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    lat: float
    lng: float


class AddressGeometry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    location: AddressGeometryLocation


class AddressSearchResult(BaseModel):
    """Street-focused result matching the listing-flow reference format.

    Field names are intentionally snake_case to match the reference payload
    (address, context, formatted_address, geometry, type).
    """

    model_config = ConfigDict(populate_by_name=True)

    address: str
    context: str
    formatted_address: str
    geometry: AddressGeometry
    type: str


class AddressSearchResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    request_id: str
    results: list[AddressSearchResult]
    status: str
