import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/api/bookings";
import type {
  CreateBookingRequest,
  UpdateBookingRequest,
} from "@/types";

export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  byListing: (listingId: number) =>
    [...bookingKeys.lists(), "listing", listingId] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: number) => [...bookingKeys.details(), id] as const,
};

export function useBookings() {
  return useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: () => bookingsApi.getAll(),
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  });
}

export function useListingBookings(listingId: number) {
  return useQuery({
    queryKey: bookingKeys.byListing(listingId),
    queryFn: () => bookingsApi.getByListingId(listingId),
    enabled: !!listingId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBookingRequest }) =>
      bookingsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(bookingKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
