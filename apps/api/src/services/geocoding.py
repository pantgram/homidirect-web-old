import hashlib
import math
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from src.models.geocoding_cache import GeocodingCache


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


async def _get_cached(db: AsyncSession, query_hash: str):
    result = await db.execute(
        select(GeocodingCache).where(
            GeocodingCache.query_hash == query_hash,
            GeocodingCache.expires_at > datetime.now(timezone.utc),
        )
    )
    return result.scalar_one_or_none()


async def _set_cache(db: AsyncSession, query_hash: str, query_text: str, country_code: str | None, lang: str | None, results: list):
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)
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


async def search(db: AsyncSession, text: str, country_code: str | None = None, limit: int = 10, lang: str = "el"):
    query_str = f"{text}:{country_code or ''}:{lang}"
    query_hash = hashlib.sha256(query_str.encode()).hexdigest()

    cached = await _get_cached(db, query_hash)
    if cached:
        return cached.results

    params: dict = {
        "q": text,
        "format": "json",
        "addressdetails": 1,
        "limit": min(limit, 20),
        "accept-language": lang,
    }
    if country_code:
        params["countrycodes"] = country_code.lower()

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://nominatim.openstreetmap.org/search",
            params=params,
            headers={"User-Agent": "HomiDirect/1.0"},
        )
        resp.raise_for_status()
        data = resp.json()

    results = []
    seen = []
    for item in data:
        address = item.get("address", {})
        city = address.get("city") or address.get("town") or address.get("village", "")
        lat = float(item["lat"])
        lon = float(item["lon"])

        duplicate = False
        for s in seen:
            if s["city"].lower() == city.lower() and _haversine(s["lat"], s["lon"], lat, lon) < 5:
                duplicate = True
                break
        if duplicate:
            continue

        entry = {
            "place_id": item.get("place_id"),
            "formatted": item.get("display_name", ""),
            "address": address.get("road", ""),
            "city": city,
            "country": address.get("country", ""),
            "suburb": address.get("suburb") or address.get("neighbourhood", ""),
            "postal_code": address.get("postcode", ""),
            "result_type": item.get("type", ""),
            "lat": lat,
            "lon": lon,
        }
        results.append(entry)
        seen.append({"city": city, "lat": lat, "lon": lon})

    await _set_cache(db, query_hash, text, country_code, lang, results)
    return results[:limit]


async def reverse(db: AsyncSession, lat: float, lon: float, lang: str = "el"):
    query_str = f"reverse:{lat}:{lon}:{lang}"
    query_hash = hashlib.sha256(query_str.encode()).hexdigest()

    cached = await _get_cached(db, query_hash)
    if cached:
        return cached.results[0] if cached.results else None

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"lat": lat, "lon": lon, "format": "json", "accept-language": lang},
            headers={"User-Agent": "HomiDirect/1.0"},
        )
        resp.raise_for_status()
        data = resp.json()

    address = data.get("address", {})
    result = {
        "address": data.get("display_name", ""),
        "city": address.get("city") or address.get("town") or address.get("village", ""),
        "country": address.get("country", ""),
        "postal_code": address.get("postcode", ""),
        "lat": float(data.get("lat", lat)),
        "lon": float(data.get("lon", lon)),
    }

    await _set_cache(db, query_hash, f"{lat},{lon}", None, lang, [result])
    return result
