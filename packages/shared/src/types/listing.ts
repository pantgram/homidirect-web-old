export type PropertyType = "apartment" | "house" | "studio" | "room";

export type FloorType = "basement" | "semi-basement" | "ground" | "1st" | "2nd" | "3rd" | "4th" | "5th" | "6th+";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  city: string;
  postalCode?: string;
  floor: FloorType;
  levels: number;
  kitchens: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  dateAvailable: string;
  dateBuilt: number;
  views_count: number;
  country?: string;
  propertyType: PropertyType;
  available: boolean;
  landlordId: number;
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
}

export interface CreateListingRequest {
  title: string;
  description?: string;
  price: number;
  city: string;
  postalCode?: string;
  floor?: FloorType;
  levels?: number;
  kitchens?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  dateAvailable?: string;
  dateBuilt?: number;
  country?: string;
  propertyType: PropertyType;
  available?: boolean;
  titleEl?: string;
  titleEn?: string;
  descriptionEl?: string;
  descriptionEn?: string;
}

export interface UpdateListingRequest extends Partial<CreateListingRequest> {}

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
  listingId: number;
  url: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}
