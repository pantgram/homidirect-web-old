import { eq, and, gt, lt } from "drizzle-orm";
import { createHash } from "crypto";
import { db } from "config/db";
import { geoapifyCache } from "./geoapify.model";
import { config } from "config/env";
import {
  GeoapifyResult,
  LocationResult,
  SearchQuery,
  GeoapifyAutocompleteResponse,
} from "./geoapify.types";

const GEOAPIFY_BASE_URL = "https://api.geoapify.com/v1/geocode";
const CACHE_TTL_DAYS = 30;
const PROXIMITY_THRESHOLD_METERS = 100;

function hashQuery(query: SearchQuery): string {
  const normalized = `${query.text.toLowerCase()}:${query.countryCode || ""}:${query.lang || "el"}`;
  return createHash("sha256").update(normalized).digest("hex");
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

function deduplicateResults(results: LocationResult[]): LocationResult[] {
  const seen = new Map<string, LocationResult>();

  for (const result of results) {
    if (seen.has(result.placeId)) {
      continue;
    }

    let isDuplicate = false;

    for (const [, existing] of seen) {
      const distance = haversineDistance(result.lat, result.lon, existing.lat, existing.lon);
      if (distance <= PROXIMITY_THRESHOLD_METERS) {
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

function transformResult(result: GeoapifyResult): LocationResult {
  return {
    placeId: result.place_id,
    formatted: result.formatted,
    city: result.city || result.municipality || result.county || result.name || "",
    country: result.country,
    suburb: result.suburb,
    neighbourhood: result.neighbourhood,
    quarter: result.quarter,
    postalCode: result.postcode,
    resultType: result.result_type,
    lat: result.lat,
    lon: result.lon,
  };
}

export const GeoapifyService = {
  async search(query: SearchQuery): Promise<LocationResult[]> {
    if (!query.text || query.text.length < 2) {
      return [];
    }

    if (!config.geoapifyApiKey) {
      console.warn("Geoapify API key not configured");
      return [];
    }

    const queryHash = hashQuery(query);
    const now = new Date();

    const [cached] = await db
      .select()
      .from(geoapifyCache)
      .where(and(eq(geoapifyCache.queryHash, queryHash), gt(geoapifyCache.expiresAt, now)))
      .limit(1);

    if (cached) {
      return cached.results as LocationResult[];
    }

    const params = new URLSearchParams({
      text: query.text,
      apiKey: config.geoapifyApiKey,
      limit: String(query.limit || 10),
      lang: query.lang || "el",
      format: "json",
    });

    if (query.countryCode) {
      params.append("filter", `countrycode:${query.countryCode}`);
    }

    const response = await fetch(`${GEOAPIFY_BASE_URL}/autocomplete?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Geoapify API error:", response.status, errorText);
      throw new Error(`Geoapify API error: ${response.status}`);
    }

    const data: GeoapifyAutocompleteResponse = await response.json();
    const rawResults = data.results || [];

    const transformedResults = rawResults.map(transformResult);
    const dedupedResults = deduplicateResults(transformedResults);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

    await db
      .insert(geoapifyCache)
      .values({
        queryHash,
        queryText: query.text,
        countryCode: query.countryCode || null,
        lang: query.lang || "el",
        results: dedupedResults,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: geoapifyCache.queryHash,
        set: {
          results: dedupedResults,
          expiresAt,
          createdAt: now,
        },
      });

    return dedupedResults;
  },

  async cleanupExpired(): Promise<number> {
    const now = new Date();
    const deleted = await db
      .delete(geoapifyCache)
      .where(lt(geoapifyCache.expiresAt, now))
      .returning({ id: geoapifyCache.id });
    return deleted.length;
  },
};
