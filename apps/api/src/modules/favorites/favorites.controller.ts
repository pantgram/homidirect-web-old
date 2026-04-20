import { FastifyRequest, FastifyReply } from "fastify";
import { FavoritesService } from "./favorites.service";
import { NotFoundError } from "utils/errors";
import { ListingService } from "modules/listings/listings.service";

export const FavoritesController = {
  async getMyFavorites(
    request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>,
    reply: FastifyReply,
  ) {
    const userId = (request as any).user.id;
    const { page = 1, limit = 15 } = request.query;
    const result = await FavoritesService.getUserFavorites(userId, page, limit);
    return reply.code(200).send(result);
  },

  async addFavorite(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request as any).user.id;
    const listingId = parseInt(request.params.listingId);

    // Check if listing exists
    const listing = await ListingService.getListingById(listingId);
    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    const added = await FavoritesService.addFavorite(userId, listingId);

    return reply.code(200).send({
      success: true,
      added,
      message: added ? "Added to favorites" : "Already in favorites",
    });
  },

  async removeFavorite(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request as any).user.id;
    const listingId = parseInt(request.params.listingId);

    const removed = await FavoritesService.removeFavorite(userId, listingId);

    if (!removed) {
      throw new NotFoundError("Favorite not found");
    }

    return reply.code(200).send({
      success: true,
      message: "Removed from favorites",
    });
  },

  async checkFavorite(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request as any).user.id;
    const listingId = parseInt(request.params.listingId);

    const isFavorited = await FavoritesService.isFavorited(userId, listingId);

    return reply.code(200).send({ isFavorited });
  },

  async getFavoriteIds(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user.id;
    const favoriteIds = await FavoritesService.getFavoriteIds(userId);

    return reply.code(200).send({ favoriteIds });
  },
};
