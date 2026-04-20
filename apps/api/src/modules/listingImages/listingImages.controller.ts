import { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "crypto";
import { ListingImageService } from "./listingImages.service";
import { NotFoundError, ValidationError } from "utils/errors";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "./listingImages.types";

export const ListingImageController = {
  async getByListingId(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const listingId = parseInt(request.params.listingId);
    const images = await ListingImageService.getImagesByListingId(listingId);
    return reply.code(200).send({ images });
  },

  async getBySessionId(
    request: FastifyRequest<{ Params: { sessionId: string } }>,
    reply: FastifyReply,
  ) {
    const { sessionId } = request.params;
    const images = await ListingImageService.getImagesBySessionId(sessionId);
    return reply.code(200).send({ images });
  },

  async upload(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const listingId = parseInt(request.params.listingId);

    const file = await request.file();
    if (!file) {
      throw new ValidationError("No image file provided");
    }

    if (
      !ALLOWED_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      throw new ValidationError(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
      );
    }

    const buffer = await file.toBuffer();
    if (buffer.length > MAX_FILE_SIZE) {
      throw new ValidationError(
        `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    const image = await ListingImageService.uploadImage(
      listingId,
      buffer,
      file.filename,
      file.mimetype,
    );

    return reply.code(201).send({ image });
  },

  async uploadPending(
    request: FastifyRequest<{ Params: { sessionId: string } }>,
    reply: FastifyReply,
  ) {
    let { sessionId } = request.params;

    if (sessionId === "new") {
      sessionId = randomUUID();
    }

    const file = await request.file();
    if (!file) {
      throw new ValidationError("No image file provided");
    }

    if (
      !ALLOWED_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      throw new ValidationError(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
      );
    }

    const buffer = await file.toBuffer();
    if (buffer.length > MAX_FILE_SIZE) {
      throw new ValidationError(
        `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    const image = await ListingImageService.uploadPendingImage(
      sessionId,
      buffer,
      file.filename,
      file.mimetype,
    );

    return reply.code(201).send({ image, uploadSessionId: sessionId });
  },

  async delete(
    request: FastifyRequest<{ Params: { listingId: string; imageId: string } }>,
    reply: FastifyReply,
  ) {
    const imageId = parseInt(request.params.imageId);
    const listingId = parseInt(request.params.listingId);

    const image = await ListingImageService.getImageById(imageId);
    if (!image) {
      throw new NotFoundError("Image not found");
    }

    if (image.listingId !== listingId) {
      throw new NotFoundError("Image not found for this listing");
    }

    const deleted = await ListingImageService.deleteImage(imageId);
    if (!deleted) {
      throw new NotFoundError("Image not found");
    }

    return reply.code(204).send();
  },

  async deletePending(
    request: FastifyRequest<{ Params: { sessionId: string; imageId: string } }>,
    reply: FastifyReply,
  ) {
    const imageId = parseInt(request.params.imageId);
    const { sessionId } = request.params;

    const deleted = await ListingImageService.deletePendingImage(
      imageId,
      sessionId,
    );
    if (!deleted) {
      throw new NotFoundError("Image not found");
    }

    return reply.code(204).send();
  },
};
