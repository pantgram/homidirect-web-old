import { eq, and, sql, inArray, desc, asc } from "drizzle-orm";
import { db } from "config/db";
import { interestedListings } from "models/interestedListings.model";
import { listings } from "modules/listings/listings.model";
import { listingImages } from "modules/listingImages/listingImages.model";
import {
  ListingSearchResponse,
  PaginatedResponse,
  ListingImageBasic,
} from "modules/listings/listings.types";

export const FavoritesService = {
  async getUserFavorites(
    userId: number,
    page: number = 1,
    limit: number = 15,
  ): Promise<PaginatedResponse<ListingSearchResponse>> {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(interestedListings)
      .where(eq(interestedListings.userId, userId));
    const total = countResult[0]?.count ?? 0;

    // Get paginated favorite listings
    const results = await db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        city: listings.city,
        postalCode: listings.postalCode,
        floor: listings.floor,
        levels: listings.levels,
        kitchens: listings.kitchens,
        bedrooms: listings.bedrooms,
        bathrooms: listings.bathrooms,
        area: listings.area,
        elevator: listings.elevator,
        parkingSpace: listings.parkingSpace,
        furnished: listings.furnished,
        zoneType: listings.zoneType,
        listingStatus: listings.listingStatus,
        dateAvailable: listings.dateAvailable,
        dateBuilt: listings.dateBuilt,
        views_count: listings.views_count,
        country: listings.country,
        propertyType: listings.propertyType,
        available: listings.available,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        landlordId: listings.landlordId,
        verificationStatus: listings.verificationStatus,
        verifiedAt: listings.verifiedAt,
        verifiedBy: listings.verifiedBy,
        isFeatured: listings.isFeatured,
        featuredUntil: listings.featuredUntil,
        titleEl: listings.titleEl,
        titleEn: listings.titleEn,
        descriptionEl: listings.descriptionEl,
        descriptionEn: listings.descriptionEn,
      })
      .from(interestedListings)
      .innerJoin(listings, eq(interestedListings.listingId, listings.id))
      .where(eq(interestedListings.userId, userId))
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

  async addFavorite(userId: number, listingId: number): Promise<boolean> {
    try {
      console.log("Adding favorite:", { userId, listingId });
      await db.insert(interestedListings).values({ userId, listingId });
      return true;
    } catch (error: any) {
      // Handle duplicate key error (already favorited)
      if (error.code === "23505") {
        return false;
      }
      throw error;
    }
  },

  async removeFavorite(userId: number, listingId: number): Promise<boolean> {
    const result = await db
      .delete(interestedListings)
      .where(
        and(
          eq(interestedListings.userId, userId),
          eq(interestedListings.listingId, listingId),
        ),
      )
      .returning({ listingId: interestedListings.listingId });

    return result.length > 0;
  },

  async isFavorited(userId: number, listingId: number): Promise<boolean> {
    const result = await db
      .select({ listingId: interestedListings.listingId })
      .from(interestedListings)
      .where(
        and(
          eq(interestedListings.userId, userId),
          eq(interestedListings.listingId, listingId),
        ),
      )
      .limit(1);

    return result.length > 0;
  },

  async getFavoriteIds(userId: number): Promise<number[]> {
    const result = await db
      .select({ listingId: interestedListings.listingId })
      .from(interestedListings)
      .where(eq(interestedListings.userId, userId));

    return result.map((r) => r.listingId);
  },

  async getPrimaryImagesForListings(
    listingIds: number[],
  ): Promise<Map<number, ListingImageBasic>> {
    if (listingIds.length === 0) {
      return new Map();
    }

    const images = await db
      .select({
        id: listingImages.id,
        url: listingImages.url,
        listingId: listingImages.listingId,
        createdAt: listingImages.createdAt,
      })
      .from(listingImages)
      .where(inArray(listingImages.listingId, listingIds))
      .orderBy(asc(listingImages.createdAt));

    // Group by listingId and take the first one (oldest = primary)
    const imageMap = new Map<number, ListingImageBasic>();
    for (const img of images) {
      if (img.listingId !== null && !imageMap.has(img.listingId)) {
        imageMap.set(img.listingId, img);
      }
    }

    return imageMap;
  },
};
