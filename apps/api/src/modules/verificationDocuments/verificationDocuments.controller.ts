import { FastifyRequest, FastifyReply } from "fastify";
import { VerificationDocumentService } from "./verificationDocuments.service";
import { NotFoundError, ValidationError } from "utils/errors";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE,
  DocumentType,
  DOCUMENT_TYPES,
} from "./verificationDocuments.types";
import { AuthenticatedRequest } from "middleware/authorization";

export const VerificationDocumentController = {
  async getStatus(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const listingId = parseInt(request.params.listingId);
    const status =
      await VerificationDocumentService.getVerificationStatus(listingId);
    return reply.code(200).send(status);
  },

  async getDocuments(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const listingId = parseInt(request.params.listingId);
    const documents =
      await VerificationDocumentService.getDocumentsByListingId(listingId);
    return reply.code(200).send({ documents });
  },

  async getHistory(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const listingId = parseInt(request.params.listingId);
    const history =
      await VerificationDocumentService.getVerificationHistory(listingId);
    return reply.code(200).send({ history });
  },

  async upload(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const listingId = parseInt(request.params.listingId);
    const user = (request as AuthenticatedRequest).user;

    // Get file and fields from multipart
    const data = await request.file();
    if (!data) {
      throw new ValidationError("No document file provided");
    }

    // Get document type from fields
    const documentTypeField = data.fields.documentType;
    let documentType: DocumentType = "UTILITY_BILL"; // default

    if (documentTypeField && "value" in documentTypeField) {
      const value = documentTypeField.value as string;
      if (DOCUMENT_TYPES.includes(value as DocumentType)) {
        documentType = value as DocumentType;
      } else {
        throw new ValidationError(
          `Invalid document type. Allowed types: ${DOCUMENT_TYPES.join(", ")}`,
        );
      }
    }

    // Validate mime type
    if (
      !ALLOWED_DOCUMENT_MIME_TYPES.includes(
        data.mimetype as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number],
      )
    ) {
      throw new ValidationError(
        `Invalid file type. Allowed types: PDF, JPEG, PNG, WebP`,
      );
    }

    // Read buffer and validate size
    const buffer = await data.toBuffer();
    if (buffer.length > MAX_DOCUMENT_SIZE) {
      throw new ValidationError(
        `File size exceeds maximum of ${MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`,
      );
    }

    const document = await VerificationDocumentService.uploadDocument(
      listingId,
      user.id,
      documentType,
      buffer,
      data.filename,
      data.mimetype,
    );

    return reply.code(201).send({ document });
  },

  async delete(
    request: FastifyRequest<{
      Params: { listingId: string; documentId: string };
    }>,
    reply: FastifyReply,
  ) {
    const documentId = parseInt(request.params.documentId);
    const user = (request as AuthenticatedRequest).user;
    const isAdmin = user.role === "ADMIN";

    const deleted = await VerificationDocumentService.deleteDocument(
      documentId,
      user.id,
      isAdmin,
    );

    if (!deleted) {
      throw new NotFoundError("Document not found");
    }

    return reply.code(204).send();
  },

  async review(
    request: FastifyRequest<{
      Params: { listingId: string };
      Body: { status: "APPROVED" | "REJECTED"; notes?: string };
    }>,
    reply: FastifyReply,
  ) {
    const listingId = parseInt(request.params.listingId);
    const user = (request as AuthenticatedRequest).user;
    const { status, notes } = request.body;

    await VerificationDocumentService.reviewVerification(
      listingId,
      user.id,
      status,
      notes,
    );

    return reply.code(200).send({
      message: `Listing verification ${status.toLowerCase()} successfully`,
    });
  },

  async getPending(request: FastifyRequest, reply: FastifyReply) {
    const pending = await VerificationDocumentService.getPendingVerifications();
    return reply.code(200).send({ listings: pending });
  },
};
