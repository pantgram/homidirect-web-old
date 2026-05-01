import { z } from "zod";

export const availabilitySlotIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Availability Slot ID must be a valid number"),
});

export const listingIdParamSchema = z.object({
  listingId: z.string().regex(/^\d+$/, "Listing ID must be a valid number"),
});

export const createAvailabilitySlotSchema = z.object({
  listingId: z.number().int().positive("Listing ID must be a positive integer"),
  startTime: z
    .string()
    .datetime("Invalid date format. Use ISO 8601 format"),
  endTime: z.string().datetime("Invalid date format. Use ISO 8601 format"),
  isBooked: z.boolean().optional(),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export const updateAvailabilitySlotSchema = z.object({
  startTime: z
    .string()
    .datetime("Invalid date format. Use ISO 8601 format")
    .optional(),
  endTime: z.string().datetime("Invalid date format. Use ISO 8601 format").optional(),
  isBooked: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export type AvailabilitySlotIdParam = z.infer<typeof availabilitySlotIdParamSchema>;
export type ListingIdParam = z.infer<typeof listingIdParamSchema>;
export type CreateAvailabilitySlotInput = z.infer<typeof createAvailabilitySlotSchema>;
export type UpdateAvailabilitySlotInput = z.infer<typeof updateAvailabilitySlotSchema>;
