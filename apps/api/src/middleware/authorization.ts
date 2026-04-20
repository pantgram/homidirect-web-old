import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "config/db";
import { listings } from "modules/listings/listings.model";
import { bookings } from "modules/bookings/bookings.model";
import { eq } from "drizzle-orm";

export type UserRole = "LANDLORD" | "TENANT" | "BOTH" | "ADMIN";

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: number;
    email: string;
    role: UserRole;
  };
}

/**
 * Helper to check if user is an admin
 */
export function isAdmin(user: { role: UserRole }): boolean {
  return user.role === "ADMIN";
}

/**
 * Middleware to check if user has required role(s)
 * ADMIN role always has access to all routes
 */
export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as AuthenticatedRequest).user;

    if (!user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    // ADMIN role bypasses role checks
    if (isAdmin(user)) {
      return;
    }

    if (!roles.includes(user.role)) {
      return reply.code(403).send({
        error: "Forbidden",
        message: `This action requires one of the following roles: ${roles.join(
          ", ",
        )}`,
      });
    }
  };
}

/**
 * Middleware to require ADMIN role specifically
 */
export function requireAdmin() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as AuthenticatedRequest).user;

    if (!user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    if (!isAdmin(user)) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "This action requires ADMIN role",
      });
    }
  };
}

/**
 * Middleware to verify user owns the resource (based on userId param)
 * ADMIN role bypasses this check
 */
export async function verifyUserOwnership(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user = (request as AuthenticatedRequest).user;
  const params = request.params as { id: string };
  const userId = parseInt(params.id);

  if (!user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  // ADMIN can access any user's data
  if (isAdmin(user)) {
    return;
  }

  if (user.id !== userId) {
    return reply.code(403).send({
      error: "Forbidden",
      message: "You can only access your own data",
    });
  }
}

/**
 * Middleware to verify user owns the listing
 * ADMIN role bypasses this check
 */
export async function verifyListingOwnership(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user = (request as AuthenticatedRequest).user;
  const params = request.params as { listingId: string };
  const listingId = parseInt(params.listingId);
  if (!user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  // ADMIN can modify any listing
  if (isAdmin(user)) {
    return;
  }

  // Check if listing exists and get landlordId
  const [listing] = await db
    .select({ landlordId: listings.landlordId })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) {
    return reply.code(404).send({ error: "Listing not found" });
  }

  if (listing.landlordId !== user.id) {
    return reply.code(403).send({
      error: "Forbidden",
      message: "You can only modify your own listings",
    });
  }
}

/**
 * Middleware to verify user is involved in the booking (either as tenant or landlord)
 * ADMIN role bypasses this check
 */
export async function verifyBookingOwnership(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user = (request as AuthenticatedRequest).user;
  const params = request.params as { id: string };
  const bookingId = parseInt(params.id);

  if (!user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  // ADMIN can access any booking
  if (isAdmin(user)) {
    return;
  }

  // Check if booking exists and get tenant and landlord ids
  const [booking] = await db
    .select({
      tenantId: bookings.candidateId,
      landlordId: bookings.landlordId,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    return reply.code(404).send({ error: "Booking not found" });
  }

  // User must be either the tenant or the landlord
  if (booking.tenantId !== user.id && booking.landlordId !== user.id) {
    return reply.code(403).send({
      error: "Forbidden",
      message: "You can only access bookings you are involved in",
    });
  }
}

/**
 * Middleware to ensure landlord can only create listings for themselves
 * ADMIN role can create listings for any user
 */
export async function verifyListingCreation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user = (request as AuthenticatedRequest).user;
  const body = request.body as { landlordId?: number };

  if (!user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  // ADMIN can create listings for any user
  if (isAdmin(user)) {
    // If no landlordId provided, default to admin's own id
    if (!body.landlordId) {
      body.landlordId = user.id;
    }
    return;
  }

  // If landlordId is provided in body, verify it matches the authenticated user
  if (body.landlordId && body.landlordId !== user.id) {
    return reply.code(403).send({
      error: "Forbidden",
      message: "You can only create listings for yourself",
    });
  }

  // Automatically set landlordId to the authenticated user
  body.landlordId = user.id;
}
