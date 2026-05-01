import { z } from "zod";

/**
 * Booking ID parameter schema
 */
export const bookingIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Booking ID must be a valid number"),
});

/**
 * Create booking schema
 */
export const createBookingSchema = z.object({
  listingId: z.number().int().positive("Listing ID must be a positive integer"),
  scheduledAt: z.string().datetime("Invalid date format. Use ISO 8601 format"),
  meetLink: z.string().url("Meet link must be a valid URL").optional(),
  availabilitySlotId: z.number().int().positive("Availability Slot ID must be a positive integer").optional(),
});

/**
 * Update booking schema
 */
export const updateBookingSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "DECLINED", "CANCELLED"], {
      errorMap: () => ({
        message:
          "Status must be one of: PENDING, CONFIRMED, DECLINED, CANCELLED",
      }),
    })
    .optional(),
  scheduledAt: z
    .string()
    .datetime("Invalid date format. Use ISO 8601 format")
    .optional(),
  meetLink: z.string().url("Meet link must be a valid URL").optional(),
});

export type BookingIdParam = z.infer<typeof bookingIdParamSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
