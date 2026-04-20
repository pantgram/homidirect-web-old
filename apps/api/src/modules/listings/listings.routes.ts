import { FastifyInstance } from "fastify";
import { ListingController } from "./listings.controller";
import {
  requireRole,
  verifyListingOwnership,
  verifyListingCreation,
} from "middleware/authorization";
import { validateBody, validateParams, validateQuery } from "plugins/validator";
import {
  createListingSchema,
  updateListingSchema,
  listingIdParamSchema,
  searchListingsSchema,
  contactOwnerSchema,
} from "schemas/listing.schema";

export async function listingRoutes(fastify: FastifyInstance) {
  // Get platform stats - public endpoint
  fastify.get("/stats", ListingController.getStats);

  // Search listings - public with auth gate for pagination limits
  // Supports: full-text search, multi-filters, geolocation, sort, pagination
  fastify.get(
    "/search",
    {
      preValidation: [
        validateQuery(searchListingsSchema),
        // Optional auth - try to authenticate but don't fail if not authenticated
        async (request) => {
          try {
            const payload = await request.jwtVerify();
            (request as any).user = {
              id: (payload as any).id,
              email: (payload as any).email,
              role: (payload as any).role,
            };
          } catch {
            // Not authenticated - that's fine for search
          }
        },
      ],
    },
    ListingController.search,
  );

  // Get distinct cities for location filter dropdown
  fastify.get("/cities", ListingController.getCities);

  // Get current user's listings - requires authentication (landlord only)
  fastify.get<{ Querystring: { page?: number; limit?: number } }>(
    "/my-listings",
    {
      preValidation: [fastify.authenticate, requireRole("LANDLORD", "BOTH")],
    },
    ListingController.getMyListings,
  );

  // Get all listings - public (anyone can browse)
  fastify.get("", ListingController.getAll);

  // Get listing by ID - public (anyone can view)
  fastify.get<{ Params: { listingId: string } }>(
    "/:listingId",
    {
      preValidation: [validateParams(listingIdParamSchema)],
    },
    ListingController.getById,
  );

  // Create listing - only landlords, and only for themselves
  fastify.post(
    "",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH"),
        validateBody(createListingSchema),
        verifyListingCreation,
      ],
    },
    ListingController.create as any,
  );

  // Update listing - only the landlord who owns it
  fastify.patch<{ Params: { listingId: string } }>(
    "/:listingId",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH"),
        validateParams(listingIdParamSchema),
        validateBody(updateListingSchema),
        verifyListingOwnership,
      ],
    },
    ListingController.update as any,
  );

  // Delete listing - only the landlord who owns it
  fastify.delete<{ Params: { listingId: string } }>(
    "/:listingId",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH"),
        validateParams(listingIdParamSchema),
        verifyListingOwnership,
      ],
    },
    ListingController.delete as any,
  );

  // Contact listing owner - public endpoint (no auth required)
  fastify.post<{ Params: { listingId: string } }>(
    "/:listingId/contact",
    {
      preValidation: [
        validateParams(listingIdParamSchema),
        validateBody(contactOwnerSchema),
      ],
    },
    ListingController.contactOwner as any,
  );
}
