import { eq, desc, sql, and, SQL } from "drizzle-orm";
import { db } from "config/db";
import { users, userRoleEnum, userStatusEnum } from "modules/users/users.model";
import {
  listings,
  verificationStatusEnum,
} from "modules/listings/listings.model";
import { NotFoundError } from "utils/errors";

type UserRole = (typeof userRoleEnum)["enumValues"][number];
type UserStatus = (typeof userStatusEnum)["enumValues"][number];
type VerificationStatus = (typeof verificationStatusEnum)["enumValues"][number];

interface PaginationParams {
  page: number;
  limit: number;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export const AdminService = {
  async getUsers(
    params: PaginationParams & { role?: string; status?: string },
  ): Promise<PaginatedResult<any>> {
    const { page, limit, role, status } = params;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (role) {
      conditions.push(eq(users.role, role as any));
    }
    if (status) {
      conditions.push(eq(users.status, status as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);

    const totalItems = countResult?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const data = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },

  async updateUser(
    userId: number,
    updates: { role?: UserRole; status?: UserStatus },
  ): Promise<any> {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...(updates.role && { role: updates.role }),
        ...(updates.status && { status: updates.status }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updatedUser;
  },

  async getListings(
    params: PaginationParams & {
      verificationStatus?: string;
      available?: boolean;
      landlordId?: number;
    },
  ): Promise<PaginatedResult<any>> {
    const { page, limit, verificationStatus, available, landlordId } = params;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (verificationStatus) {
      conditions.push(
        eq(listings.verificationStatus, verificationStatus as any),
      );
    }
    if (available !== undefined) {
      conditions.push(eq(listings.available, available));
    }
    if (landlordId) {
      conditions.push(eq(listings.landlordId, landlordId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings)
      .where(whereClause);

    const totalItems = countResult?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const data = await db
      .select({
        id: listings.id,
        title: listings.title,
        city: listings.city,
        price: listings.price,
        propertyType: listings.propertyType,
        available: listings.available,
        verificationStatus: listings.verificationStatus,
        isFeatured: listings.isFeatured,
        landlordId: listings.landlordId,
        createdAt: listings.createdAt,
      })
      .from(listings)
      .where(whereClause)
      .orderBy(desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  },

  async updateListing(
    listingId: number,
    updates: {
      available?: boolean;
      verificationStatus?: VerificationStatus;
      isFeatured?: boolean;
    },
  ): Promise<any> {
    const [listing] = await db
      .select({ id: listings.id })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    const [updatedListing] = await db
      .update(listings)
      .set({
        ...(updates.available !== undefined && {
          available: updates.available,
        }),
        ...(updates.verificationStatus && {
          verificationStatus: updates.verificationStatus,
        }),
        ...(updates.isFeatured !== undefined && {
          isFeatured: updates.isFeatured,
        }),
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId))
      .returning({
        id: listings.id,
        title: listings.title,
        city: listings.city,
        price: listings.price,
        available: listings.available,
        verificationStatus: listings.verificationStatus,
        isFeatured: listings.isFeatured,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
      });

    return updatedListing;
  },

  async deleteListing(listingId: number): Promise<boolean> {
    const [listing] = await db
      .select({ id: listings.id })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    const result = await db
      .delete(listings)
      .where(eq(listings.id, listingId))
      .returning({ id: listings.id });

    return result.length > 0;
  },

  async getStats(): Promise<{
    users: {
      total: number;
      byRole: Record<string, number>;
      byStatus: Record<string, number>;
    };
    listings: {
      total: number;
      available: number;
      byVerificationStatus: Record<string, number>;
    };
  }> {
    const [userStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        byRole: sql<
          Record<string, number>
        >`json_object_agg(role, role_count) FROM (SELECT role, count(*) as role_count FROM users GROUP BY role)`,
        byStatus: sql<
          Record<string, number>
        >`json_object_agg(status, status_count) FROM (SELECT status, count(*) as status_count FROM users GROUP BY status)`,
      })
      .from(users);

    const [listingStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        available: sql<number>`count(*) FILTER (WHERE available = true)::int`,
        byVerificationStatus: sql<
          Record<string, number>
        >`json_object_agg(verification_status, vs_count) FROM (SELECT verification_status, count(*) as vs_count FROM listings GROUP BY verification_status)`,
      })
      .from(listings);

    return {
      users: {
        total: userStats?.total || 0,
        byRole: userStats?.byRole || {},
        byStatus: userStats?.byStatus || {},
      },
      listings: {
        total: listingStats?.total || 0,
        available: listingStats?.available || 0,
        byVerificationStatus: listingStats?.byVerificationStatus || {},
      },
    };
  },
};
