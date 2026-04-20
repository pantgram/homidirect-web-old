import { FastifyRequest, FastifyReply } from "fastify";
import { ListingService } from "./listings.service";
import {
  CreateListingDTO,
  UpdateListingDTO,
  SearchListingsParams,
} from "./listings.types";
import { NotFoundError } from "utils/errors";
import { sendContactOwnerEmail } from "@/utils/email";
import { UserService } from "modules/users/users.service";
import { ContactOwnerInput } from "schemas/listing.schema";

export const ListingController = {
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await ListingService.getStats();
    return reply.code(200).send(stats);
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const listings = await ListingService.getAllListings();
    return reply.code(200).send({ listings: listings });
  },

  async getById(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const id = parseInt(request.params.listingId);
    const listing = await ListingService.getListingById(id);

    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    return reply.code(200).send({ listing: listing });
  },

  async create(
    request: FastifyRequest<{
      Body: CreateListingDTO & { uploadSessionId?: string };
    }>,
    reply: FastifyReply,
  ) {
    const { uploadSessionId, ...listingData } = request.body;
    const listing = await ListingService.createListing(
      listingData,
      uploadSessionId,
    );
    return reply.code(201).send({ listing });
  },

  async update(
    request: FastifyRequest<{
      Params: { listingId: string };
      Body: UpdateListingDTO;
    }>,
    reply: FastifyReply,
  ) {
    const id = parseInt(request.params.listingId);
    const listing = await ListingService.updateListing(id, request.body);

    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    return reply.code(200).send({ listing: listing });
  },

  async delete(
    request: FastifyRequest<{ Params: { listingId: string } }>,
    reply: FastifyReply,
  ) {
    const id = parseInt(request.params.listingId);
    const deleted = await ListingService.deleteListing(id);

    if (!deleted) {
      throw new NotFoundError("Listing not found");
    }

    return reply.code(204).send();
  },

  async search(
    request: FastifyRequest<{ Querystring: SearchListingsParams }>,
    reply: FastifyReply,
  ) {
    const params = request.query;
    // Check if user is authenticated (user object exists from optional auth)
    const isAuthenticated = !!(request as any).user?.id;

    const result = await ListingService.searchListings(params, isAuthenticated);
    return reply.code(200).send(result);
  },

  async getCities(request: FastifyRequest, reply: FastifyReply) {
    const cities = await ListingService.getDistinctCities();
    return reply.code(200).send({ cities });
  },

  async getMyListings(
    request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>,
    reply: FastifyReply,
  ) {
    const userId = (request as any).user.id;
    const { page = 1, limit = 15 } = request.query;
    const result = await ListingService.getListingsByLandlordId(
      userId,
      page,
      limit,
    );
    return reply.code(200).send(result);
  },

  async contactOwner(
    request: FastifyRequest<{
      Params: { listingId: string };
      Body: ContactOwnerInput;
    }>,
    reply: FastifyReply,
  ) {
    const listingId = parseInt(request.params.listingId);
    const { name, email, phone, message } = request.body;

    // Get the listing to find the landlord
    const listing = await ListingService.getListingById(listingId);
    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    // Get the landlord's info
    const owner = await UserService.getUserById(listing.landlordId);
    if (!owner) {
      throw new NotFoundError("Property owner not found");
    }

    // Send email to the owner
    await sendContactOwnerEmail({
      ownerEmail: owner.email,
      ownerName: `${owner.firstName} ${owner.lastName}`.trim(),
      senderName: name,
      senderEmail: email,
      senderPhone: phone,
      message,
      listingTitle: listing.title,
      listingId: listing.id,
    });

    return reply
      .code(200)
      .send({ success: true, message: "Message sent successfully" });
  },
};
