import { FastifyInstance } from "fastify";
import { ListingImageController } from "./listingImages.controller";
import { requireRole, verifyListingOwnership } from "middleware/authorization";
import { validateParams } from "plugins/validator";
import {
  listingImageParamsSchema,
  deleteImageParamsSchema,
  sessionParamsSchema,
  deletePendingImageParamsSchema,
} from "schemas/listingImage.schema";

export async function listingImageRoutes(fastify: FastifyInstance) {
  // Get all images for a listing - public
  fastify.get<{ Params: { listingId: string } }>(
    "/:listingId/images",
    {
      preValidation: [validateParams(listingImageParamsSchema)],
    },
    ListingImageController.getByListingId,
  );

  // Upload image to a listing - landlord only, must own the listing
  fastify.post<{ Params: { listingId: string } }>(
    "/:listingId/images",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH"),
        validateParams(listingImageParamsSchema),
        verifyListingOwnership,
      ],
    },
    ListingImageController.upload as any,
  );

  // Delete image from a listing - landlord only, must own the listing
  fastify.delete<{ Params: { listingId: string; imageId: string } }>(
    "/:listingId/images/:imageId",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH"),
        validateParams(deleteImageParamsSchema),
        verifyListingOwnership,
      ],
    },
    ListingImageController.delete as any,
  );
}

export async function pendingImageRoutes(fastify: FastifyInstance) {
  // Get pending images by session ID - authenticated landlords only
  fastify.get<{ Params: { sessionId: string } }>(
    "/:sessionId",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH"),
        validateParams(sessionParamsSchema),
      ],
    },
    ListingImageController.getBySessionId,
  );

  // Upload pending image - authenticated landlords only
  // Use "new" as sessionId to generate a new session
  fastify.post<{ Params: { sessionId: string } }>(
    "/:sessionId",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH"),
        validateParams(sessionParamsSchema),
      ],
    },
    ListingImageController.uploadPending as any,
  );

  // Delete pending image - authenticated landlords only
  fastify.delete<{ Params: { sessionId: string; imageId: string } }>(
    "/:sessionId/:imageId",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH"),
        validateParams(deletePendingImageParamsSchema),
      ],
    },
    ListingImageController.deletePending as any,
  );
}
