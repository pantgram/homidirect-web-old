export type BookingStatus = "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED";

export interface Booking {
  id: number;
  status: BookingStatus;
  scheduledAt: string;
  meetLink: string | null;
  createdAt: string;
  candidateId: number;
  landlordId: number;
  listingId: number;
  availabilitySlotId: number | null;
}

export interface CreateBookingRequest {
  listingId: number;
  scheduledAt: string;
  meetLink?: string;
  availabilitySlotId?: number;
}

export interface UpdateBookingRequest {
  status?: BookingStatus;
  scheduledAt?: string;
  meetLink?: string;
}
