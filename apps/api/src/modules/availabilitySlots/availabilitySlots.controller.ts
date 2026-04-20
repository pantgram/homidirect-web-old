import { FastifyRequest, FastifyReply } from "fastify";
import { AvailabilitySlotService } from "./availabilitySlots.service";
import {
  CreateAvailabilitySlotDTO,
  UpdateAvailabilitySlotDTO,
} from "./availabilitySlots.types";
import { NotFoundError } from "utils/errors";

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
    const slot = await AvailabilitySlotService.createAvailabilitySlot(
      request.body,
    );
    return reply.code(201).send({ slot });
  },

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateAvailabilitySlotDTO;
    }>,
    reply: FastifyReply,
  ) {
    const id = parseInt(request.params.id);
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
    const id = parseInt(request.params.id);
    const deleted = await AvailabilitySlotService.deleteAvailabilitySlot(id);

    if (!deleted) {
      throw new NotFoundError("Availability slot not found");
    }

    return reply.code(204).send();
  },
};
