import { apiClient } from "./client";
import type {
  ClaimTimeSlotRequest,
  CreateTimeSlotRequest,
  ProposeTimeSlotRequest,
  TimeSlot,
  UpdateTimeSlotRequest,
} from "@/types";

export const timeSlotsApi = {
  /** All non-OPEN slots where the current user is the landlord or the candidate. */
  async getMySlots(): Promise<TimeSlot[]> {
    const response = await apiClient.get<{ timeSlots: TimeSlot[] }>(
      "/time-slots/me"
    );
    return response.data.timeSlots;
  },

  /** All slots for a listing (public shape — OPEN rows hide participant fields). */
  async getByListingId(listingId: number): Promise<TimeSlot[]> {
    const response = await apiClient.get<{ timeSlots: TimeSlot[] }>(
      `/time-slots/listing/${listingId}`
    );
    return response.data.timeSlots;
  },

  /** OPEN, future slots — the still-bookable windows. */
  async getAvailableByListingId(listingId: number): Promise<TimeSlot[]> {
    const response = await apiClient.get<{ timeSlots: TimeSlot[] }>(
      `/time-slots/listing/${listingId}/available`
    );
    return response.data.timeSlots;
  },

  /** Claimed/proposed slots for a listing (landlord only, private shape). */
  async getBookingsByListingId(listingId: number): Promise<TimeSlot[]> {
    const response = await apiClient.get<{ timeSlots: TimeSlot[] }>(
      `/time-slots/listing/${listingId}/bookings`
    );
    return response.data.timeSlots;
  },

  /** Landlord: publish a new OPEN availability window. */
  async create(data: CreateTimeSlotRequest): Promise<TimeSlot> {
    const response = await apiClient.post<{ timeSlot: TimeSlot }>(
      "/time-slots",
      data
    );
    return response.data.timeSlot;
  },

  /** Candidate: request a viewing at a time with no open window. */
  async propose(data: ProposeTimeSlotRequest): Promise<TimeSlot> {
    const response = await apiClient.post<{ timeSlot: TimeSlot }>(
      "/time-slots/propose",
      data
    );
    return response.data.timeSlot;
  },

  /** Candidate: claim an OPEN window (it becomes a PENDING booking). */
  async claim(id: number, data: ClaimTimeSlotRequest = {}): Promise<TimeSlot> {
    const response = await apiClient.post<{ timeSlot: TimeSlot }>(
      `/time-slots/${id}/claim`,
      data
    );
    return response.data.timeSlot;
  },

  async getById(id: number): Promise<TimeSlot> {
    const response = await apiClient.get<{ timeSlot: TimeSlot }>(
      `/time-slots/${id}`
    );
    return response.data.timeSlot;
  },

  /**
   * Landlord fields (startTime, type) or booking transition (status, meetLink);
   * the server branches on the requested fields.
   */
  async update(id: number, data: UpdateTimeSlotRequest): Promise<TimeSlot> {
    const response = await apiClient.patch<{ timeSlot: TimeSlot }>(
      `/time-slots/${id}`,
      data
    );
    return response.data.timeSlot;
  },

  /** OPEN windows are hard-deleted; claimed/proposed ones are released. */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/time-slots/${id}`);
  },
};

export default timeSlotsApi;
