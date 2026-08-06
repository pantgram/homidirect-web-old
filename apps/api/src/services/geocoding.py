import hashlib
import math
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.settings import settings
from src.models.geocoding_cache import GeocodingCache

GEOAPIFY_BASE_URL = "https://api.geoapify.com/v1/geocode"
CACHE_TTL_DAYS = 30
DEDUP_METERS = 100

GEOAPIFY_TYPE_FILTERS = {
    "amenity",
    "building",
    "commercial",
    "county",
    "neighbourhood",
    "place",
    "postal_code",
    "street",
    "suburb",
    "village",
}


def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_radius_m = 6371000
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    return earth_radius_m * 2 * math.asin(math.sqrt(a))


async def _get_cached(db: AsyncSession, query_hash: str):
    result = await db.execute(
        select(GeocodingCache).where(
            GeocodingCache.query_hash == query_hash,
            GeocodingCache.expires_at > datetime.now(timezone.utc),
        )
    )
    return result.scalar_one_or_none()


async def _set_cache(
    db: AsyncSession,
    query_hash: str,
    query_text: str,
    country_code: str | None,
    lang: str | None,
    results: list,
):
    expires_at = datetime.now(timezone.utc) + timedelta(days=CACHE_TTL_DAYS)
    cache = GeocodingCache(
        query_hash=query_hash,
        query_text=query_text,
        country_code=country_code,
        lang=lang,
        results=results,
        expires_at=expires_at,
    )
    db.add(cache)
    await db.flush()


def _dedup(results: list[dict], threshold_meters: float) -> list[dict]:
    seen: list[dict] = []
    out: list[dict] = []
    for entry in results:
        lat = entry["lat"]
        lon = entry["lon"]
        place_id = entry.get("place_id")
        if place_id and any(s.get("place_id") == place_id for s in seen):
            continue
        if any(_haversine_meters(s["lat"], s["lon"], lat, lon) <= threshold_meters for s in seen):
            continue
        out.append(entry)
        seen.append({"place_id": place_id, "lat": lat, "lon": lon})
    return out


def _transform(item: dict) -> dict:
    city = item.get("city") or item.get("municipality") or item.get("county") or item.get("name") or ""
    return {
        "place_id": str(item.get("place_id") or ""),
        "formatted": item.get("formatted", "") or item.get("name", ""),
        "address": item.get("street", "") or item.get("address_line1", ""),
        "city": city,
        "municipality": item.get("municipality", "") or "",
        "country": item.get("country", ""),
        "suburb": item.get("suburb", "") or "",
        "neighbourhood": item.get("neighbourhood", "") or item.get("district", ""),
        "quarter": item.get("quarter", "") or "",
        "postal_code": item.get("postcode", "") or "",
        "result_type": item.get("result_type", "") or "",
        "lat": float(item.get("lat") or 0),
        "lon": float(item.get("lon") or 0),
    }


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=httpx.Timeout(settings.geoapify_request_timeout))


async def search(
    db: AsyncSession,
    text: str,
    country_code: str | None = None,
    limit: int = 10,
    lang: str = "el",
    result_type: str | None = None,
) -> list[dict]:
    if not settings.geoapify_api_key or not text or len(text) < 2:
        return []
    if result_type and result_type not in GEOAPIFY_TYPE_FILTERS:
        raise ValueError(f"Invalid result_type. Allowed: {sorted(GEOAPIFY_TYPE_FILTERS)}")

    cache_key = f"{text}:{country_code or ''}:{lang}:{result_type or ''}"
    query_hash = hashlib.sha256(cache_key.encode()).hexdigest()

    cached = await _get_cached(db, query_hash)
    if cached:
        return cached.results

    params: dict = {
        "text": text,
        "apiKey": settings.geoapify_api_key,
        "limit": min(limit, 20),
        "lang": lang,
        "format": "json",
    }
    if country_code:
        params["filter"] = f"countrycode:{country_code.lower()}"
    if result_type:
        params["type"] = result_type

    async with _client() as client:
        resp = await client.get(f"{GEOAPIFY_BASE_URL}/autocomplete", params=params)
        resp.raise_for_status()
        data = resp.json()

    results = _dedup([_transform(item) for item in data.get("results", [])], DEDUP_METERS)[:limit]
    if results:
        await _set_cache(db, query_hash, text, country_code, lang, results)
    return results


async def reverse(db: AsyncSession, lat: float, lon: float, lang: str = "el") -> dict | None:
    if not settings.geoapify_api_key:
        return None

    query_str = f"reverse:{lat}:{lon}:{lang}"
    query_hash = hashlib.sha256(query_str.encode()).hexdigest()

    cached = await _get_cached(db, query_hash)
    if cached:
        return cached.results[0] if cached.results else None

    params = {"lat": lat, "lon": lon, "apiKey": settings.geoapify_api_key, "lang": lang, "format": "json"}
    async with _client() as client:
        resp = await client.get(f"{GEOAPIFY_BASE_URL}/reverse", params=params)
        resp.raise_for_status()
        data = resp.json()

    items = data.get("results", [])
    if not items:
        return None
    item = _transform(items[0])
    result = {
        "address": item["formatted"],
        "city": item["city"],
        "municipality": item["municipality"],
        "country": item["country"],
        "suburb": item["suburb"] or item["neighbourhood"],
        "postal_code": item["postal_code"],
        "lat": item["lat"],
        "lon": item["lon"],
    }
    await _set_cache(db, query_hash, f"{lat},{lon}", None, lang, [result])
    return result


def _build_context(entry: dict) -> str:
    parts = []
    if entry.get("postal_code"):
        parts.append(entry["postal_code"])
    if entry.get("neighbourhood"):
        parts.append(entry["neighbourhood"])
    elif entry.get("suburb"):
        parts.append(entry["suburb"])
    if entry.get("city"):
        parts.append(entry["city"])
    elif entry.get("municipality"):
        parts.append(entry["municipality"])
    if entry.get("country"):
        parts.append(entry["country"])
    return " ".join(parts)


def to_address_result(entry: dict) -> dict:
    """Reshape a forward-search entry into the listing-flow address format."""
    address = entry.get("address") or entry.get("formatted", "")
    context = _build_context(entry)
    formatted = entry.get("formatted") or f"{address} {context}".strip()
    return {
        "address": address,
        "context": context,
        "formatted_address": formatted,
        "geometry": {"location": {"lat": entry.get("lat", 0.0), "lng": entry.get("lon", 0.0)}},
        "type": entry.get("result_type") or "",
    }


async def address_search(
    db: AsyncSession,
    text: str,
    country_code: str | None = None,
    limit: int = 10,
    lang: str = "el",
    result_type: str | None = None,
) -> list[dict]:
    entries = await search(db, text, country_code, limit, lang, result_type)
    return [to_address_result(e) for e in entries]
