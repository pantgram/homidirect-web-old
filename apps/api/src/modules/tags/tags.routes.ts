import { FastifyInstance } from "fastify";
import { TagController } from "./tags.controller";
import { requireRole } from "middleware/authorization";

export async function tagRoutes(fastify: FastifyInstance) {
  // Get all tags - public (anyone can view tags)
  fastify.get("", TagController.getAll);

  // Get tag by ID - public (anyone can view)
  fastify.get("/:id", TagController.getById);

  // Create tag - only landlords (they manage tags for their listings)
  fastify.post(
    "",
    {
      preValidation: [fastify.authenticate, requireRole("LANDLORD")],
    },
    TagController.create as any,
  );

  // Update tag - only landlords
  fastify.patch<{ Params: { id: string } }>(
    "/:id",
    {
      preValidation: [fastify.authenticate, requireRole("LANDLORD")],
    },
    TagController.update as any,
  );

  // Delete tag - only landlords
  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      preValidation: [fastify.authenticate, requireRole("LANDLORD")],
    },
    TagController.delete as any,
  );
}
