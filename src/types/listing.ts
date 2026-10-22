/**
 * Types mirroring the HomiDirect API contract (openapi.json):
 * - ListingResponse
 * - CreateListingRequest
 * - UpdateListingRequest
 * - ListingSearchResponse
 * - ListingImageBasic / ListingImageResponse
 * - ListingStatsResponse
 */

export type PropertyType = "apartment" | "house" | "studio" | "room";

export type FloorType = "basement" | "semi-basement" | "ground" | "1st" | "2nd" | "3rd" | "4th" | "5th" | "6th+";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type PublicationStatus = "ACTIVE" | "DRAFT";

export type Language = "en" | "el";

export function getLocalizedTitle(listing: { titleEl: string; titleEn?: string | null }, language: Language): string {
  return language === "en" && listing.titleEn ? listing.titleEn : listing.titleEl;
}

export function getLocalizedDescription(listing: { descriptionEl: string; descriptionEn?: string | null }, language: Language): string {
  return language === "en" && listing.descriptionEn ? listing.descriptionEn : listing.descriptionEl;
}

/** Mirrors `ListingResponse` (also the base of `ListingSearchResponse`). */
export interface Listing {
  id: number;
  price: number;
  city: string;
  postalCode: string | null;
  floor: FloorType;
  levels: number;
  kitchens: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  elevator: boolean;
  parkingSpace: boolean;
  furnished: boolean;
  dateAvailable: string;
  dateBuilt: number;
  viewsCount: number;
  country: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  propertyType: string;
  createdAt: string;
  updatedAt: string;
  landlordId: number;
  landlordPhone: string | null;
  verificationStatus: string;
  verifiedAt: string | null;
  verifiedBy: number | null;
  isFeatured: boolean;
  featuredUntil: string | null;
  titleEl: string;
  titleEn: string | null;
  descriptionEl: string;
  descriptionEn: string | null;
  publicationStatus: PublicationStatus | null;
}

/** Mirrors `CreateListingRequest`. */
export interface CreateListingRequest {
  price: number;
  city: string;
  postalCode?: string | null;
  floor?: FloorType | null;
  levels?: number | null;
  kitchens?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  elevator?: boolean | null;
  parkingSpace?: boolean | null;
  furnished?: boolean | null;
  dateAvailable?: string | null;
  dateBuilt?: number | null;
  country?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  propertyType: string;
  landlordId: number;
  landlordPhone?: string | null;
  titleEl: string;
  titleEn?: string | null;
  descriptionEl?: string | null;
  descriptionEn?: string | null;
  publicationStatus?: PublicationStatus | null;
}

/** Mirrors `UpdateListingRequest`. */
export interface UpdateListingRequest {
  price?: number | null;
  city?: string | null;
  postalCode?: string | null;
  floor?: FloorType | null;
  levels?: number | null;
  kitchens?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  elevator?: boolean | null;
  parkingSpace?: boolean | null;
  furnished?: boolean | null;
  dateAvailable?: string | null;
  dateBuilt?: number | null;
  country?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  propertyType?: string | null;
  landlordPhone?: string | null;
  titleEl?: string | null;
  titleEn?: string | null;
  descriptionEl?: string | null;
  descriptionEn?: string | null;
  publicationStatus?: PublicationStatus | null;
}

/** Query parameters of `GET /listings/search`. */
export interface SearchListingsParams {
  q?: string;
  propertyType?: string;
  city?: string;
  region?: string;
  country?: string;
  floor?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  minKitchens?: number;
  maxKitchens?: number;
  minLevels?: number;
  maxLevels?: number;
  elevator?: boolean;
  parkingSpace?: boolean;
  furnished?: boolean;
  dateAvailableFrom?: string;
  dateAvailableTo?: string;
  minDateBuilt?: number;
  maxDateBuilt?: number;
  isFeatured?: boolean;
  verificationStatus?: string;
  sortBy?: "featured" | "newest" | "oldest" | "price_asc" | "price_desc" | "area_asc" | "area_desc";
  page?: number;
  limit?: number;
}

/** Mirrors `ListingImageBasic` / `ListingImageResponse` (same shape). */
export interface ListingImage {
  id: number;
  url: string;
  listingId: number | null;
  createdAt: string;
}

/** Mirrors `ListingSearchResponse`. */
export interface ListingSearchResult extends Listing {
  primaryImage: ListingImage | null;
}
