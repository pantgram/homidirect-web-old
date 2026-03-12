import { Listing } from "./listings.model";

export type ListingResponse = Pick<
  Listing,
  | "id"
  | "title"
  | "description"
  | "price"
  | "city"
  | "postalCode"
  | "floor"
  | "levels"
  | "kitchens"
  | "bedrooms"
  | "bathrooms"
  | "area"
  | "dateAvailable"
  | "dateBuilt"
  | "views_count"
  | "country"
  | "propertyType"
  | "available"
  | "createdAt"
  | "updatedAt"
  | "landlordId"
  | "verificationStatus"
  | "verifiedAt"
  | "verifiedBy"
  | "isFeatured"
  | "featuredUntil"
  | "titleEl"
  | "titleEn"
  | "descriptionEl"
  | "descriptionEn"
>;

export type ListingImageBasic = {
  id: number;
  url: string;
  listingId: number | null;
  createdAt: Date;
};

export type ListingSearchResponse = ListingResponse & {
  primaryImage?: ListingImageBasic | null;
};

export type CreateListingDTO = {
  title: string;
  description?: string;
  price: number;
  city: string;
  postalCode?: string;
  floor:
    | "basement"
    | "semi-basement"
    | "ground"
    | "1st"
    | "2nd"
    | "3rd"
    | "4th"
    | "5th"
    | "6th+";
  levels?: number;
  kitchens: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  dateAvailable: string;
  dateBuilt: number;
  country: string;
  propertyType: "apartment" | "house" | "studio" | "room";
  available: boolean;
  landlordId: number;
  titleEl: string;
  titleEn?: string;
  descriptionEl: string;
  descriptionEn?: string;
};

export type UpdateListingDTO = Partial<CreateListingDTO>;

export type SearchListingsParams = {
  q?: string;
  propertyType?: "apartment" | "house" | "studio" | "room";
  city?: string;
  region?: string;
  country?: string;
  floor?:
    | "basement"
    | "semi-basement"
    | "ground"
    | "1st"
    | "2nd"
    | "3rd"
    | "4th"
    | "5th"
    | "6th+";
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
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  sortBy?:
    | "featured"
    | "newest"
    | "oldest"
    | "price_asc"
    | "price_desc"
    | "area_asc"
    | "area_desc";
  page?: number;
  limit?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
