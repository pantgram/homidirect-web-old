from src.schemas.base import CamelModel


class GeocodingSearchResult(CamelModel):
    place_id: int | None
    formatted: str
    address: str
    city: str
    country: str
    suburb: str
    postal_code: str
    result_type: str
    lat: float
    lon: float


class GeocodingSearchResponse(CamelModel):
    results: list[GeocodingSearchResult]


class GeocodingReverseResult(CamelModel):
    address: str
    city: str
    country: str
    postal_code: str
    lat: float
    lon: float


class GeocodingReverseResponse(CamelModel):
    result: GeocodingReverseResult | None
