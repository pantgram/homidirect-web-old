import { apiClient } from "./client";
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
} from "@/types";

export const bookingsApi = {
  async getAll(): Promise<Booking[]> {
    const response = await apiClient.get<{ bookings: Booking[] }>("/bookings");
    return response.data.bookings;
  },

  async getById(id: number): Promise<Booking> {
    const response = await apiClient.get<{ booking: Booking }>(`/bookings/${id}`);
    return response.data.booking;
  },

  async getByListingId(listingId: number): Promise<Booking[]> {
    const response = await apiClient.get<{ bookings: Booking[] }>(`/bookings/listing/${listingId}`);
    return response.data.bookings;
  },

  async create(data: CreateBookingRequest): Promise<Booking> {
    const response = await apiClient.post<{ booking: Booking }>("/bookings", data);
    return response.data.booking;
  },

  async update(id: number, data: UpdateBookingRequest): Promise<Booking> {
    const response = await apiClient.patch<{ booking: Booking }>(
      `/bookings/${id}`,
      data
    );
    return response.data.booking;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/bookings/${id}`);
  },
};

export default bookingsApi;
