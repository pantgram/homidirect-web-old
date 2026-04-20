import { FastifyInstance } from "fastify";
import { FavoritesController } from "./favorites.controller";
import { validateParams } from "plugins/validator";
import { listingIdParamSchema } from "schemas/listing.schema";

export async function favoritesRoutes(fastify: FastifyInstance) {
  // Get current user's favorites - requires authentication
  fastify.get<{ Querystring: { page?: number; limit?: number } }>(
    "",
    {
      preValidation: [fastify.authenticate],
    },
    FavoritesController.getMyFavorites,
  );

  // Get list of favorite listing IDs (for quick checks in UI)
  fastify.get(
    "/ids",
    {
      preValidation: [fastify.authenticate],
    },
    FavoritesController.getFavoriteIds,
  );

  // Check if a specific listing is favorited
  fastify.get<{ Params: { listingId: string } }>(
    "/:listingId/check",
    {
      preValidation: [
        fastify.authenticate,
        validateParams(listingIdParamSchema),
      ],
    },
    FavoritesController.checkFavorite,
  );

  // Add listing to favorites
  fastify.post<{ Params: { listingId: string } }>(
    "/:listingId",
    {
      preValidation: [
        fastify.authenticate,
        validateParams(listingIdParamSchema),
      ],
    },
    FavoritesController.addFavorite,
  );

  // Remove listing from favorites
  fastify.delete<{ Params: { listingId: string } }>(
    "/:listingId",
    {
      preValidation: [
        fastify.authenticate,
        validateParams(listingIdParamSchema),
      ],
    },
    FavoritesController.removeFavorite,
  );
}
