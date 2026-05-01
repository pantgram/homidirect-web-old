import { FastifyRequest, FastifyReply } from "fastify";
import { BookingService } from "./bookings.service";
import { CreateBookingDTO, UpdateBookingDTO, CreateBookingInput } from "./bookings.types";
import { NotFoundError, ForbiddenError } from "utils/errors";
import { AuthenticatedRequest } from "middleware/authorization";
import { listings } from "modules/listings/listings.model";
import { availabilitySlots } from "modules/availabilitySlots/availabilitySlots.model";
import { eq, and } from "drizzle-orm";
import { db } from "config/db";

export const BookingController = {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as AuthenticatedRequest).user;
    const bookings = await BookingService.getBookingsByUserId(user.id);
    return reply.code(200).send({ bookings: bookings });
  },

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const id = parseInt(request.params.id);
    const booking = await BookingService.getBookingById(id);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    return reply.code(200).send({ booking: booking });
  },

  async create(
    request: FastifyRequest<{ Body: CreateBookingInput }>,
    reply: FastifyReply,
  ) {
    const user = (request as AuthenticatedRequest).user;
    const { listingId, availabilitySlotId, ...rest } = request.body;

    const [listing] = await db
      .select({ id: listings.id, landlordId: listings.landlordId })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      throw new NotFoundError("Listing not found");
    }

    if (listing.landlordId === user.id) {
      throw new ForbiddenError("You cannot book your own listing");
    }

    if (availabilitySlotId) {
      const [slot] = await db
        .select({ id: availabilitySlots.id, isBooked: availabilitySlots.isBooked })
        .from(availabilitySlots)
        .where(
          and(
            eq(availabilitySlots.id, availabilitySlotId),
            eq(availabilitySlots.listingId, listingId),
          ),
        )
        .limit(1);

      if (!slot) {
        throw new ForbiddenError("Availability slot does not belong to this listing");
      }

      if (slot.isBooked) {
        throw new ForbiddenError("This time slot is already booked");
      }
    }

    const dto: CreateBookingDTO = {
      ...rest,
      candidateId: user.id,
      landlordId: listing.landlordId,
      listingId,
      availabilitySlotId,
      scheduledAt: new Date(rest.scheduledAt),
    };

    const booking = await BookingService.createBooking(dto);
    return reply.code(201).send({ booking: booking });
  },

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateBookingDTO }>,
    reply: FastifyReply,
  ) {
    const id = parseInt(request.params.id);
    const booking = await BookingService.updateBooking(id, request.body);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    return reply.code(200).send({ booking: booking });
  },

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const id = parseInt(request.params.id);
    const deleted = await BookingService.deleteBooking(id);

    if (!deleted) {
      throw new NotFoundError("Booking not found");
    }

    return reply.code(204).send();
  },
};
