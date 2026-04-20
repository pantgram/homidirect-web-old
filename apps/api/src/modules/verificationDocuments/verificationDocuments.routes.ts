import { FastifyInstance } from "fastify";
import { VerificationDocumentController } from "./verificationDocuments.controller";
import {
  requireRole,
  requireAdmin,
  verifyListingOwnership,
} from "@/middleware/authorization";
import { validateParams, validateBody } from "plugins/validator";
import {
  verificationDocumentParamsSchema,
  deleteVerificationDocumentParamsSchema,
  reviewVerificationBodySchema,
} from "schemas/verificationDocument.schema";

export async function verificationDocumentRoutes(fastify: FastifyInstance) {
  // Get verification status for a listing - landlord (owner) or admin
  fastify.get<{ Params: { listingId: string } }>(
    "/:listingId/verification",
    {
      preValidation: [
        fastify.authenticate,
        validateParams(verificationDocumentParamsSchema),
        verifyListingOwnership,
      ],
    },
    VerificationDocumentController.getStatus,
  );

  // Get verification documents for a listing - landlord (owner) or admin
  fastify.get<{ Params: { listingId: string } }>(
    "/:listingId/verification/documents",
    {
      preValidation: [
        fastify.authenticate,
        validateParams(verificationDocumentParamsSchema),
        verifyListingOwnership,
      ],
    },
    VerificationDocumentController.getDocuments,
  );

  // Get verification history for a listing - landlord (owner) or admin
  fastify.get<{ Params: { listingId: string } }>(
    "/:listingId/verification/history",
    {
      preValidation: [
        fastify.authenticate,
        validateParams(verificationDocumentParamsSchema),
        verifyListingOwnership,
      ],
    },
    VerificationDocumentController.getHistory,
  );

  // Upload verification document - landlord only, must own the listing
  fastify.post<{ Params: { listingId: string } }>(
    "/:listingId/verification/documents",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH"),
        validateParams(verificationDocumentParamsSchema),
        verifyListingOwnership,
      ],
    },
    VerificationDocumentController.upload as any,
  );

  // Delete verification document - landlord (owner) or admin
  fastify.delete<{ Params: { listingId: string; documentId: string } }>(
    "/:listingId/verification/documents/:documentId",
    {
      preValidation: [
        fastify.authenticate,
        validateParams(deleteVerificationDocumentParamsSchema),
        verifyListingOwnership,
      ],
    },
    VerificationDocumentController.delete as any,
  );

  // Review verification (approve/reject) - admin only
  fastify.post<{
    Params: { listingId: string };
    Body: { status: "APPROVED" | "REJECTED"; notes?: string };
  }>(
    "/:listingId/verification/review",
    {
      preValidation: [
        fastify.authenticate,
        requireAdmin(),
        validateParams(verificationDocumentParamsSchema),
        validateBody(reviewVerificationBodySchema),
      ],
    },
    VerificationDocumentController.review as any,
  );
}

export async function adminVerificationRoutes(fastify: FastifyInstance) {
  // Get all pending verifications - admin only
  fastify.get(
    "/pending",
    {
      preValidation: [fastify.authenticate, requireAdmin()],
    },
    VerificationDocumentController.getPending,
  );
}
