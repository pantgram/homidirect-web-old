import { apiClient } from "./client";
import type {
  AvailabilitySlot,
  CreateAvailabilitySlotRequest,
  UpdateAvailabilitySlotRequest,
} from "@/types";

export const availabilitySlotsApi = {
  async getByListingId(listingId: number): Promise<AvailabilitySlot[]> {
    const response = await apiClient.get<{ slots: AvailabilitySlot[] }>(
      `/availability-slots/listing/${listingId}`
    );
    return response.data.slots;
  },

  async getAvailableSlotsByListingId(
    listingId: number
  ): Promise<AvailabilitySlot[]> {
    const response = await apiClient.get<{ slots: AvailabilitySlot[] }>(
      `/availability-slots/listing/${listingId}/available`
    );
    return response.data.slots;
  },

  async getById(id: number): Promise<AvailabilitySlot> {
    const response = await apiClient.get<{ slot: AvailabilitySlot }>(
      `/availability-slots/${id}`
    );
    return response.data.slot;
  },

  async create(data: CreateAvailabilitySlotRequest): Promise<AvailabilitySlot> {
    const response = await apiClient.post<{ slot: AvailabilitySlot }>(
      "/availability-slots",
      data
    );
    return response.data.slot;
  },

  async update(
    id: number,
    data: UpdateAvailabilitySlotRequest
  ): Promise<AvailabilitySlot> {
    const response = await apiClient.patch<{ slot: AvailabilitySlot }>(
      `/availability-slots/${id}`,
      data
    );
    return response.data.slot;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/availability-slots/${id}`);
  },
};

export default availabilitySlotsApi;
