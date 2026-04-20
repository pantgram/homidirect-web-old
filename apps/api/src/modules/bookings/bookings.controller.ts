import { FastifyRequest, FastifyReply } from "fastify";
import { BookingService } from "./bookings.service";
import { CreateBookingDTO, UpdateBookingDTO } from "./bookings.types";
import { NotFoundError } from "utils/errors";

export const BookingController = {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const bookings = await BookingService.getAllBookings();
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
    request: FastifyRequest<{ Body: CreateBookingDTO }>,
    reply: FastifyReply,
  ) {
    const booking = await BookingService.createBooking(request.body);
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
