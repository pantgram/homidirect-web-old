import { FastifyInstance } from "fastify";
import { UserController } from "./users.controller";
import { verifyUserOwnership } from "middleware/authorization";
import { validateBody, validateParams } from "plugins/validator";
import { updateUserSchema, userIdParamSchema } from "schemas/user.schema";
import { favoritesRoutes } from "modules/favorites/favorites.routes";

export async function userRoutes(fastify: FastifyInstance) {
  // Get current authenticated user
  fastify.get(
    "/me",
    { preValidation: [fastify.authenticate] },
    UserController.me,
  );
  fastify.register(favoritesRoutes, { prefix: "/favorites" });
  // Get user by ID - PROTECTED: only authenticated users can view user profiles
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    {
      preValidation: [fastify.authenticate, validateParams(userIdParamSchema)],
    },
    UserController.getById as any,
  );

  // Update user - only the user themselves
  fastify.patch<{ Params: { id: string } }>(
    "/:id",
    {
      preValidation: [
        fastify.authenticate,
        validateParams(userIdParamSchema),
        validateBody(updateUserSchema),
        verifyUserOwnership,
      ],
    },
    UserController.update as any,
  );

  // Delete user - only the user themselves
  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      preValidation: [
        fastify.authenticate,
        validateParams(userIdParamSchema),
        verifyUserOwnership,
      ],
    },
    UserController.delete as any,
  );
}
