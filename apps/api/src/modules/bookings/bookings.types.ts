import { Booking } from "./bookings.model";

export type BookingResponse = Pick<
  Booking,
  | "id"
  | "status"
  | "scheduledAt"
  | "meetLink"
  | "createdAt"
  | "candidateId"
  | "landlordId"
  | "listingId"
  | "availabilitySlotId"
>;

export type CreateBookingDTO = {
  scheduledAt: Date;
  meetLink?: string;
  candidateId: number;
  landlordId: number;
  listingId: number;
  availabilitySlotId?: number;
};

export type CreateBookingInput = {
  scheduledAt: string;
  meetLink?: string;
  listingId: number;
  availabilitySlotId?: number;
};

export type UpdateBookingDTO = Partial<
  Omit<CreateBookingDTO, "candidateId" | "landlordId" | "listingId">
>;
