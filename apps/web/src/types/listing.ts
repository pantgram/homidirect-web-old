export type PropertyType = "apartment" | "house" | "studio" | "room";

export type FloorType = "basement" | "semi-basement" | "ground" | "1st" | "2nd" | "3rd" | "4th" | "5th" | "6th+";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ListingStatusType = "Renovated" | "Luxurious" | "Under construction" | "Neoclassical";

export type ZoneType = "Residential" | "Agricultural" | "Commercial" | "Industrial" | "Regeneration";

export type Language = "en" | "el";

export function getLocalizedTitle(listing: { titleEl: string; titleEn?: string }, language: Language): string {
  return language === "en" && listing.titleEn ? listing.titleEn : listing.titleEl;
}

export function getLocalizedDescription(listing: { descriptionEl: string; descriptionEn?: string }, language: Language): string {
  return language === "en" && listing.descriptionEn ? listing.descriptionEn : listing.descriptionEl;
}

export interface Listing {
  id: number;
  price: number;
  city: string;
  postalCode?: string;
  floor: FloorType;
  levels: number;
  kitchens: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  elevator: boolean;
  parkingSpace: boolean;
  furnished: boolean;
  zoneType: ZoneType;
  listingStatus: ListingStatusType | null;
  dateAvailable: string;
  dateBuilt: number;
  viewsCount: number;
  country?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  propertyType: PropertyType;
  available: boolean;
  landlordId: number;
  landlordPhone?: string;
  createdAt: string;
  updatedAt: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: number;
  isFeatured: boolean;
  featuredUntil?: string;
  titleEl: string;
  titleEn?: string;
  descriptionEl: string;
  descriptionEn?: string;
  images?: ListingImage[];
}

export interface CreateListingRequest {
  price: number;
  city: string;
  postalCode?: string;
  floor?: FloorType;
  levels?: number;
  kitchens?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  elevator?: boolean;
  parkingSpace?: boolean;
  furnished?: boolean;
  zoneType?: ZoneType;
  listingStatus?: ListingStatusType;
  dateAvailable?: string;
  dateBuilt?: number;
  country?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  propertyType: PropertyType;
  available?: boolean;
  landlordPhone?: string;
  titleEl: string;
  titleEn?: string;
  descriptionEl?: string;
  descriptionEn?: string;
}

export type UpdateListingRequest = Partial<CreateListingRequest>;

export interface ListingsQueryParams {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: PropertyType;
  floor?: FloorType;
  available?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchListingsParams {
  q?: string;
  propertyType?: PropertyType;
  city?: string;
  region?: string;
  country?: string;
  floor?: FloorType;
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
  dateAvailableFrom?: string;
  dateAvailableTo?: string;
  minDateBuilt?: number;
  maxDateBuilt?: number;
  available?: boolean;
  isFeatured?: boolean;
  verificationStatus?: VerificationStatus;
  sortBy?: "featured" | "newest" | "oldest" | "price_asc" | "price_desc" | "area_asc" | "area_desc";
  page?: number;
  limit?: number;
}

export interface ListingSearchResult extends Listing {
  primaryImage?: ListingImage;
}

export interface ListingImage {
  id: number;
  listingId: number | null;
  url: string;
  uploadSessionId: string | null;
  createdAt: string;
}
