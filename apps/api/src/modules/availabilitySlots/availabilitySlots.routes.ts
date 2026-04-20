import { FastifyInstance } from "fastify";
import { AvailabilitySlotController } from "./availabilitySlots.controller";
import { verifyListingOwnership, requireRole } from "middleware/authorization";
import { validateBody, validateParams } from "plugins/validator";
import {
  createAvailabilitySlotSchema,
  updateAvailabilitySlotSchema,
  availabilitySlotIdParamSchema,
  listingIdParamSchema,
} from "@/schemas/availability-slot.schema";

export async function availabilitySlotRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: { listingId: string } }>(
    "/listing/:listingId/available",
    {
      preValidation: [validateParams(listingIdParamSchema)],
    },
    AvailabilitySlotController.getAvailableByListingId as any,
  );

  fastify.get<{ Params: { listingId: string } }>(
    "/listing/:listingId",
    {
      preValidation: [validateParams(listingIdParamSchema)],
    },
    AvailabilitySlotController.getByListingId as any,
  );

  fastify.get<{ Params: { id: string } }>(
    "/:id",
    {
      preValidation: [validateParams(availabilitySlotIdParamSchema)],
    },
    AvailabilitySlotController.getById as any,
  );

  fastify.post(
    "",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH", "ADMIN"),
        validateBody(createAvailabilitySlotSchema),
      ],
    },
    AvailabilitySlotController.create as any,
  );

  fastify.patch<{ Params: { id: string } }>(
    "/:id",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH", "ADMIN"),
        validateParams(availabilitySlotIdParamSchema),
        validateBody(updateAvailabilitySlotSchema),
      ],
    },
    AvailabilitySlotController.update as any,
  );

  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      preValidation: [
        fastify.authenticate,
        requireRole("LANDLORD", "BOTH", "ADMIN"),
        validateParams(availabilitySlotIdParamSchema),
      ],
    },
    AvailabilitySlotController.delete as any,
  );
}
