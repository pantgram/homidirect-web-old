import { eq, and, gt, lt } from "drizzle-orm";
import { createHash } from "crypto";
import { db } from "config/db";
import { geocodingCache } from "./geocoding.model";
import {
  PhotonResponse,
  PhotonFeature,
  NominatimReverseResponse,
  LocationResult,
  ReverseGeocodeResult,
  SearchQuery,
  ReverseQuery,
} from "./geocoding.types";

const PHOTON_BASE_URL = "https://photon.komoot.io/api";
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const CACHE_TTL_DAYS = 30;
const PROXIMITY_THRESHOLD_METERS = 100;

function hashQuery(input: string): string {
  return createHash("sha256").update(input.toLowerCase()).digest("hex");
}

function hashSearchQuery(query: SearchQuery): string {
  return hashQuery(`search:${query.text}:${query.countryCode || ""}:${query.lang || "el"}`);
}

function hashReverseQuery(query: ReverseQuery): string {
  return hashQuery(`reverse:${query.lat.toFixed(6)}:${query.lon.toFixed(6)}:${query.lang || "el"}`);
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const RESULT_TYPE_PRIORITY: Record<string, number> = {
  city: 1,
  municipality: 2,
  town: 3,
  village: 4,
  locality: 5,
  suburb: 6,
  quarter: 7,
  neighbourhood: 8,
  amenity: 9,
  building: 10,
  street: 11,
  hamlet: 12,
};

function normalizeCityName(city: string): string {
  return city.toLowerCase().trim().replace(/\s+/g, " ");
}

function isCityLevel(type: string): boolean {
  return ["city", "municipality", "town", "village", "locality", "hamlet"].includes(type);
}

function deduplicateResults(results: LocationResult[]): LocationResult[] {
  const seen = new Map<string, LocationResult>();

  for (const result of results) {
    if (seen.has(result.placeId)) {
      continue;
    }

    let isDuplicate = false;

    for (const [existingKey, existing] of seen) {
      const closeProximity = haversineDistance(result.lat, result.lon, existing.lat, existing.lon) <= PROXIMITY_THRESHOLD_METERS;

      const bothCityLevel = isCityLevel(result.resultType) && isCityLevel(existing.resultType);
      const normalizedCity = normalizeCityName(result.city);
      const normalizedExistingCity = normalizeCityName(existing.city);
      const sameCityName = normalizedCity && normalizedExistingCity && normalizedCity === normalizedExistingCity;

      if ((bothCityLevel && sameCityName) || closeProximity) {
        const existingPriority = RESULT_TYPE_PRIORITY[existing.resultType] ?? 99;
        const resultPriority = RESULT_TYPE_PRIORITY[result.resultType] ?? 99;

        if (resultPriority < existingPriority) {
          seen.delete(existingKey);
          seen.set(result.placeId, result);
        }
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      seen.set(result.placeId, result);
    }
  }

  return Array.from(seen.values());
}

function buildFormattedAddress(props: PhotonFeature["properties"]): string {
  const parts: string[] = [];
  if (props.name) parts.push(props.name);
  if (props.street) {
    const streetPart = props.housenumber ? `${props.street} ${props.housenumber}` : props.street;
    if (!parts.includes(streetPart)) parts.push(streetPart);
  }
  if (props.postcode) parts.push(props.postcode);
  if (props.city) {
    if (!parts.some((p) => p.includes(props.city!))) parts.push(props.city);
  }
  if (props.country) parts.push(props.country);
  return parts.join(", ");
}

function mapPhotonType(props: PhotonFeature["properties"]): string {
  const osmValue = props.osm_value || "";
  const osmKey = props.osm_key || "";
  if (osmKey === "place" && (osmValue === "city" || osmValue === "town" || osmValue === "village" || osmValue === "hamlet")) return osmValue;
  if (osmKey === "place" && osmValue === "suburb") return "suburb";
  if (osmKey === "highway") return "street";
  if (osmKey === "building") return "building";
  if (osmKey === "amenity") return "amenity";
  if (osmKey === "boundary" && osmValue === "administrative") return "municipality";
  return props.type || "locality";
}

function transformPhotonFeature(feature: PhotonFeature): LocationResult {
  const props = feature.properties;
  const [lon, lat] = feature.geometry.coordinates;
  const formatted = buildFormattedAddress(props);

  return {
    placeId: `${props.osm_type || "N"}${props.osm_id || ""}`,
    formatted,
    address: formatted,
    city: props.city || props.county || props.state || props.name || "",
    country: props.country || "",
    suburb: props.city && props.name && props.name !== props.city ? props.name : undefined,
    postalCode: props.postcode,
    resultType: mapPhotonType(props),
    lat,
    lon,
  };
}

export const GeocodingService = {
  async search(query: SearchQuery): Promise<LocationResult[]> {
    if (!query.text || query.text.length < 2) {
      return [];
    }

    const queryHash = hashSearchQuery(query);
    const now = new Date();

    const [cached] = await db
      .select()
      .from(geocodingCache)
      .where(and(eq(geocodingCache.queryHash, queryHash), gt(geocodingCache.expiresAt, now)))
      .limit(1);

    if (cached) {
      return cached.results as LocationResult[];
    }

    const params = new URLSearchParams({
      q: query.text,
      limit: String(query.limit || 10),
      lang: query.lang || "el",
    });

    if (query.countryCode) {
      params.append("countrycodeFilter", query.countryCode.toUpperCase());
    }

    const response = await fetch(`${PHOTON_BASE_URL}/?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Photon API error:", response.status, errorText);
      throw new Error(`Photon API error: ${response.status}`);
    }

    const data: PhotonResponse = await response.json();
    const transformedResults = (data.features || []).map(transformPhotonFeature);
    const dedupedResults = deduplicateResults(transformedResults);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

    await db
      .insert(geocodingCache)
      .values({
        queryHash,
        queryText: query.text,
        countryCode: query.countryCode || null,
        lang: query.lang || "el",
        results: dedupedResults,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: geocodingCache.queryHash,
        set: {
          results: dedupedResults,
          expiresAt,
          createdAt: now,
        },
      });

    return dedupedResults;
  },

  async reverseGeocode(query: ReverseQuery): Promise<ReverseGeocodeResult | null> {
    const queryHash = hashReverseQuery(query);
    const now = new Date();

    const [cached] = await db
      .select()
      .from(geocodingCache)
      .where(and(eq(geocodingCache.queryHash, queryHash), gt(geocodingCache.expiresAt, now)))
      .limit(1);

    if (cached && cached.results && Array.isArray(cached.results) && cached.results.length > 0) {
      return cached.results[0] as ReverseGeocodeResult;
    }

    const params = new URLSearchParams({
      lat: String(query.lat),
      lon: String(query.lon),
      format: "json",
      "accept-language": query.lang || "el",
      addressdetails: "1",
      zoom: "18",
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
      headers: {
        "User-Agent": "HomiDirect/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Nominatim API error:", response.status, errorText);
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data: NominatimReverseResponse = await response.json();

    if (!data.address) {
      return null;
    }

    const addr = data.address;
    const city = addr.city || addr.town || addr.village || addr.municipality || "";
    const streetParts: string[] = [];
    if (addr.road) streetParts.push(addr.road);
    if (addr.house_number) streetParts.push(addr.house_number);
    const street = streetParts.join(" ");

    const displayParts: string[] = [];
    if (street) displayParts.push(street);
    if (addr.postcode) displayParts.push(addr.postcode);
    if (city) displayParts.push(city);
    if (addr.country) displayParts.push(addr.country);
    const formatted = displayParts.join(", ");

    const result: ReverseGeocodeResult = {
      address: formatted,
      city,
      country: addr.country || "",
      postalCode: addr.postcode,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

    await db
      .insert(geocodingCache)
      .values({
        queryHash,
        queryText: `reverse:${query.lat},${query.lon}`,
        countryCode: addr.country_code || null,
        lang: query.lang || "el",
        results: [result],
        expiresAt,
      })
      .onConflictDoUpdate({
        target: geocodingCache.queryHash,
        set: {
          results: [result],
          expiresAt,
          createdAt: now,
        },
      });

    return result;
  },

  async cleanupExpired(): Promise<number> {
    const now = new Date();
    const deleted = await db
      .delete(geocodingCache)
      .where(lt(geocodingCache.expiresAt, now))
      .returning({ id: geocodingCache.id });
    return deleted.length;
  },
};
