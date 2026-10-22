/**
 * Types mirroring the HomiDirect API contract (openapi.json):
 * - TimeSlotResponse
 * - CreateSlotRequest / ProposeSlotRequest
 * - PatchSlotRequest
 * - ClaimSlotRequest
 */

export type TimeSlotStatus =
  | "OPEN"
  | "PENDING"
  | "CONFIRMED"
  | "DECLINED"
  | "CANCELLED";

export type TimeSlotType = "REMOTE" | "ON_SITE";

/**
 * Mirrors `TimeSlotResponse`. A booking is just a claimed slot: OPEN rows are
 * landlord-authored availability, claimed/proposed rows carry a candidate. The
 * participant fields (candidateId, meetLink, landlordCreated) are null in the
 * public view of an OPEN slot.
 */
export interface TimeSlot {
  id: number;
  status: TimeSlotStatus;
  listingId: number;
  landlordId: number;
  startTime: string;
  /** Always 30 minutes after startTime; derived server-side. */
  endTime: string;
  type: TimeSlotType;
  createdAt: string;
  isBooked: boolean;
  candidateId: number | null;
  meetLink: string | null;
  landlordCreated: boolean | null;
}

/** Mirrors `CreateSlotRequest` (duration is derived server-side). */
export interface CreateTimeSlotRequest {
  listingId: number;
  startTime: string;
  type: TimeSlotType;
  meetLink?: string | null;
}

/** Mirrors `ProposeSlotRequest` — same shape as `CreateSlotRequest`. */
export type ProposeTimeSlotRequest = CreateTimeSlotRequest;

/** Mirrors `ClaimSlotRequest`. */
export interface ClaimTimeSlotRequest {
  meetLink?: string | null;
}

/**
 * Mirrors `PatchSlotRequest`. Landlord fields (startTime, type) and booking
 * transitions (status, meetLink) are two separate branches server-side.
 */
export interface UpdateTimeSlotRequest {
  startTime?: string | null;
  type?: TimeSlotType | null;
  status?: TimeSlotStatus | null;
  meetLink?: string | null;
}
