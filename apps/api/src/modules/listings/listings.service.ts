import {
  eq,
  and,
  or,
  gte,
  lte,
  ilike,
  desc,
  asc,
  sql,
  SQL,
  inArray,
} from "drizzle-orm";
import { db } from "config/db";
import { listings } from "./listings.model";
import { listingImages } from "../listingImages/listingImages.model";
import {
  CreateListingDTO,
  UpdateListingDTO,
  ListingResponse,
  ListingSearchResponse,
  SearchListingsParams,
  PaginatedResponse,
  ListingImageBasic,
} from "./listings.types";
import { ListingImageService } from "../listingImages/listingImages.service";

export const ListingService = {
  async getStats(): Promise<{
    activeListingsCount: number;
    propertyOwnersCount: number;
  }> {
    // Get active listings count
    const listingsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings)
      .where(eq(listings.available, true));
    const activeListingsCount = listingsResult[0]?.count ?? 0;

    // Get distinct landlords (property owners) count
    const ownersResult = await db
      .select({
        count: sql<number>`count(distinct ${listings.landlordId})::int`,
      })
      .from(listings);
    const propertyOwnersCount = ownersResult[0]?.count ?? 0;

    return {
      activeListingsCount,
      propertyOwnersCount,
    };
  },

  async getAllListings(): Promise<ListingResponse[]> {
    const allListings = await db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        city: listings.city,
        bedrooms: listings.bedrooms,
        bathrooms: listings.bathrooms,
        area: listings.area,
        propertyType: listings.propertyType,
        available: listings.available,
        createdAt: listings.createdAt,
        landlordId: listings.landlordId,
      })
      .from(listings);

    return allListings;
  },

  async getListingById(id: number): Promise<ListingResponse | null> {
    const [listing] = await db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        city: listings.city,
        bedrooms: listings.bedrooms,
        bathrooms: listings.bathrooms,
        area: listings.area,
        propertyType: listings.propertyType,
        available: listings.available,
        createdAt: listings.createdAt,
        landlordId: listings.landlordId,
      })
      .from(listings)
      .where(eq(listings.id, id))
      .limit(1);

    return listing || null;
  },

  async createListing(
    data: CreateListingDTO,
    uploadSessionId?: string,
  ): Promise<ListingResponse> {
    const [newListing] = await db.insert(listings).values(data).returning({
      id: listings.id,
      title: listings.title,
      description: listings.description,
      price: listings.price,
      city: listings.city,
      bedrooms: listings.bedrooms,
      bathrooms: listings.bathrooms,
      area: listings.area,
      propertyType: listings.propertyType,
      available: listings.available,
      createdAt: listings.createdAt,
      landlordId: listings.landlordId,
    });

    if (uploadSessionId) {
      console.log(
        "entered create listing with upload session id",
        uploadSessionId,
      );
      await ListingImageService.associateImagesToListing(
        uploadSessionId,
        newListing.id,
      );
    }

    return newListing;
  },

  async updateListing(
    id: number,
    data: UpdateListingDTO,
  ): Promise<ListingResponse | null> {
    const [updatedListing] = await db
      .update(listings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        city: listings.city,
        bedrooms: listings.bedrooms,
        bathrooms: listings.bathrooms,
        area: listings.area,
        propertyType: listings.propertyType,
        available: listings.available,
        createdAt: listings.createdAt,
        landlordId: listings.landlordId,
      });

    return updatedListing || null;
  },

  async deleteListing(id: number): Promise<boolean> {
    try {
      await ListingImageService.deleteImagesByListingId(id);
    } catch (error) {
      console.error("Failed to delete images from R2 for listing:", id, error);
    }

    const result = await db
      .delete(listings)
      .where(eq(listings.id, id))
      .returning({ id: listings.id });

    return result.length > 0;
  },

  async searchListings(
    params: SearchListingsParams,
    isAuthenticated: boolean = false,
  ): Promise<PaginatedResponse<ListingSearchResponse>> {
    const {
      q,
      propertyType,
      city,
      region,
      country,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minArea,
      maxArea,
      available,
      isFeatured,
      verificationStatus,
      sortBy = "featured",
      page = 1,
      limit: requestedLimit = 15,
    } = params;

    // Auth gate: limit to 10-15 for unauthenticated users
    const limit = isAuthenticated
      ? Math.min(requestedLimit, 100)
      : Math.min(requestedLimit, 15);
    const offset = (page - 1) * limit;

    // Build filter conditions
    const conditions: SQL[] = [];

    // Full-text search across title and description
    if (q) {
      const searchTerm = `%${q}%`;
      conditions.push(
        or(
          ilike(listings.title, searchTerm),
          ilike(listings.description, searchTerm),
          ilike(listings.titleEl, searchTerm),
          ilike(listings.descriptionEl, searchTerm),
          ilike(listings.titleEn, searchTerm),
          ilike(listings.descriptionEn, searchTerm),
          ilike(listings.city, searchTerm),
          ilike(listings.postalCode, searchTerm),
        )!,
      );
    }

    // Property type filter
    if (propertyType) {
      conditions.push(eq(listings.propertyType, propertyType));
    }

    // Location filters
    if (city) {
      conditions.push(ilike(listings.city, `%${city}%`));
    }

    if (region) {
      // Region search matches city patterns (e.g., "Attica" matches cities in Attica region)
      conditions.push(ilike(listings.city, `%${region}%`));
    }

    if (country) {
      conditions.push(ilike(listings.country, `%${country}%`));
    }

    // Price range filters
    if (minPrice !== undefined) {
      conditions.push(gte(listings.price, minPrice));
    }
    if (maxPrice !== undefined) {
      conditions.push(lte(listings.price, maxPrice));
    }

    // Bedroom filters
    if (minBedrooms !== undefined) {
      conditions.push(gte(listings.bedrooms, minBedrooms));
    }
    if (maxBedrooms !== undefined) {
      conditions.push(lte(listings.bedrooms, maxBedrooms));
    }

    // Bathroom filters
    if (minBathrooms !== undefined) {
      conditions.push(gte(listings.bathrooms, minBathrooms));
    }
    if (maxBathrooms !== undefined) {
      conditions.push(lte(listings.bathrooms, maxBathrooms));
    }

    // Area filters
    if (minArea !== undefined) {
      conditions.push(gte(listings.area, minArea));
    }
    if (maxArea !== undefined) {
      conditions.push(lte(listings.area, maxArea));
    }

    // Availability filter
    if (available !== undefined) {
      conditions.push(eq(listings.available, available));
    }

    // Featured filter
    if (isFeatured !== undefined) {
      conditions.push(eq(listings.isFeatured, isFeatured));
    }

    // Verification status filter
    if (verificationStatus) {
      conditions.push(eq(listings.verificationStatus, verificationStatus));
    }

    // Build sort order
    const orderBy: SQL[] = [];
    switch (sortBy) {
      case "featured":
        // Featured listings first (active featured), then by newest
        orderBy.push(desc(listings.isFeatured));
        orderBy.push(
          desc(
            sql`CASE WHEN ${listings.featuredUntil} > NOW() THEN 1 ELSE 0 END`,
          ),
        );
        orderBy.push(desc(listings.createdAt));
        break;
      case "newest":
        orderBy.push(desc(listings.createdAt));
        break;
      case "oldest":
        orderBy.push(asc(listings.createdAt));
        break;
      case "price_asc":
        orderBy.push(asc(listings.price));
        break;
      case "price_desc":
        orderBy.push(desc(listings.price));
        break;
      case "area_asc":
        orderBy.push(asc(listings.area));
        break;
      case "area_desc":
        orderBy.push(desc(listings.area));
        break;
    }

    // Build the where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings)
      .where(whereClause);
    const total = countResult[0]?.count ?? 0;

    // Get paginated results
    const results = await db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        city: listings.city,
        postalCode: listings.postalCode,
        bedrooms: listings.bedrooms,
        bathrooms: listings.bathrooms,
        area: listings.area,
        country: listings.country,
        propertyType: listings.propertyType,
        available: listings.available,
        createdAt: listings.createdAt,
        landlordId: listings.landlordId,
        isFeatured: listings.isFeatured,
        verificationStatus: listings.verificationStatus,
      })
      .from(listings)
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    // Fetch primary images for all listings in one query
    const listingIds = results.map((r) => r.id);
    const primaryImagesMap = await this.getPrimaryImagesForListings(listingIds);

    // Attach primary images to results
    const resultsWithImages: ListingSearchResponse[] = results.map(
      (listing) => ({
        ...listing,
        primaryImage: primaryImagesMap.get(listing.id) || null,
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: resultsWithImages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },

  async getDistinctCities(): Promise<string[]> {
    const result = await db
      .selectDistinct({ city: listings.city })
      .from(listings)
      .where(eq(listings.available, true))
      .orderBy(asc(listings.city));

    return result.map((r) => r.city);
  },

  async getPrimaryImagesForListings(
    listingIds: number[],
  ): Promise<Map<number, ListingImageBasic>> {
    if (listingIds.length === 0) {
      return new Map();
    }

    // Get the first image for each listing (ordered by createdAt)
    const images = await db
      .select({
        id: listingImages.id,
        url: listingImages.url,
        listingId: listingImages.listingId,
        createdAt: listingImages.createdAt,
      })
      .from(listingImages)
      .where(inArray(listingImages.listingId, listingIds));

    // Group by listingId and take the first one (oldest = primary)
    const imageMap = new Map<number, ListingImageBasic>();
    for (const img of images) {
      if (img.listingId !== null && !imageMap.has(img.listingId)) {
        imageMap.set(img.listingId, img);
      }
    }

    return imageMap;
  },

  async getListingsByLandlordId(
    landlordId: number,
    page: number = 1,
    limit: number = 15,
  ): Promise<PaginatedResponse<ListingSearchResponse>> {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings)
      .where(eq(listings.landlordId, landlordId));
    const total = countResult[0]?.count ?? 0;

    // Get paginated results
    const results = await db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        city: listings.city,
        postalCode: listings.postalCode,
        bedrooms: listings.bedrooms,
        bathrooms: listings.bathrooms,
        area: listings.area,
        country: listings.country,
        propertyType: listings.propertyType,
        available: listings.available,
        createdAt: listings.createdAt,
        landlordId: listings.landlordId,
        isFeatured: listings.isFeatured,
        verificationStatus: listings.verificationStatus,
      })
      .from(listings)
      .where(eq(listings.landlordId, landlordId))
      .orderBy(desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch primary images for all listings in one query
    const listingIds = results.map((r) => r.id);
    const primaryImagesMap = await this.getPrimaryImagesForListings(listingIds);

    // Attach primary images to results
    const resultsWithImages: ListingSearchResponse[] = results.map(
      (listing) => ({
        ...listing,
        primaryImage: primaryImagesMap.get(listing.id) || null,
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: resultsWithImages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },
};
