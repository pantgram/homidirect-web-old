import { FastifyRequest, FastifyReply } from "fastify";
import { AvailabilitySlotService } from "./availabilitySlots.service";
import {
  CreateAvailabilitySlotDTO,
  UpdateAvailabilitySlotDTO,
} from "./availabilitySlots.types";
import { NotFoundError, ForbiddenError } from "utils/errors";
import { AuthenticatedRequest } from "middleware/authorization";
import { listings } from "modules/listings/listings.model";
import { availabilitySlots } from "modules/availabilitySlots/availabilitySlots.model";
import { eq, and } from "drizzle-orm";
import { db } from "config/db";

async function verifySlotOwnership(
  slotId: number,
  userId: number,
  isAdmin: boolean,
): Promise<boolean> {
  if (isAdmin) return true;

  const [slot] = await db
    .select({ landlordId: availabilitySlots.landlordId })
    .from(availabilitySlots)
    .where(eq(availabilitySlots.id, slotId))
    .limit(1);

  return slot?.landlordId === userId;
}

async function verifyListingOwnership(
  listingId: number,
  userId: number,
  isAdmin: boolean,
): Promise<boolean> {
  if (isAdmin) return true;

  const [listing] = await db
    .select({ landlordId: listings.landlordId })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  return listing?.landlordId === userId;
}

export const AvailabilitySlotController = {
  async getAvailableByListingId(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const listingId = parseInt(request.params.listingId);
    const slots =
      await AvailabilitySlotService.getAvailableSlotsByListingId(listingId);
    return reply.code(200).send({ slots });
  },

  async getByListingId(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const listingId = parseInt(request.params.listingId);
    const slots =
      await AvailabilitySlotService.getAvailabilitySlotsByListingId(listingId);
    return reply.code(200).send({ slots });
  },

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const id = parseInt(request.params.id);
    const slot = await AvailabilitySlotService.getAvailabilitySlotById(id);

    if (!slot) {
      throw new NotFoundError("Availability slot not found");
    }

    return reply.code(200).send({ slot });
  },

  async create(
    request: FastifyRequest<{ Body: CreateAvailabilitySlotDTO }>,
    reply: FastifyReply,
  ) {
    const user = (request as AuthenticatedRequest).user;
    const { listingId, ...rest } = request.body;

    const ownsListing = await verifyListingOwnership(
      listingId,
      user.id,
      user.role === "ADMIN",
    );
    if (!ownsListing) {
      throw new ForbiddenError("You can only create slots for your own listings");
    }

    const slot = await AvailabilitySlotService.createAvailabilitySlot({
      ...rest,
      listingId,
      landlordId: user.id,
    });
    return reply.code(201).send({ slot });
  },

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateAvailabilitySlotDTO;
    }>,
    reply: FastifyReply,
  ) {
    const user = (request as AuthenticatedRequest).user;
    const id = parseInt(request.params.id);

    const owns = await verifySlotOwnership(id, user.id, user.role === "ADMIN");
    if (!owns) {
      throw new ForbiddenError("You can only update your own availability slots");
    }

    const slot = await AvailabilitySlotService.updateAvailabilitySlot(
      id,
      request.body,
    );

    if (!slot) {
      throw new NotFoundError("Availability slot not found");
    }

    return reply.code(200).send({ slot });
  },

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const user = (request as AuthenticatedRequest).user;
    const id = parseInt(request.params.id);

    const owns = await verifySlotOwnership(id, user.id, user.role === "ADMIN");
    if (!owns) {
      throw new ForbiddenError("You can only delete your own availability slots");
    }

    const deleted = await AvailabilitySlotService.deleteAvailabilitySlot(id);

    if (!deleted) {
      throw new NotFoundError("Availability slot not found");
    }

    return reply.code(204).send();
  },
};
