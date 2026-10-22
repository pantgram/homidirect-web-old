import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { timeSlotsApi } from "@/api/time-slots";
import type {
  ClaimTimeSlotRequest,
  CreateTimeSlotRequest,
  UpdateTimeSlotRequest,
} from "@/types";

export const timeSlotKeys = {
  all: ["time-slots"] as const,
  mine: () => [...timeSlotKeys.all, "me"] as const,
  lists: () => [...timeSlotKeys.all, "list"] as const,
  byListing: (listingId: number) =>
    [...timeSlotKeys.lists(), "listing", listingId] as const,
  available: (listingId: number) =>
    [...timeSlotKeys.lists(), "listing", listingId, "available"] as const,
  bookings: (listingId: number) =>
    [...timeSlotKeys.lists(), "listing", listingId, "bookings"] as const,
  details: () => [...timeSlotKeys.all, "detail"] as const,
  detail: (id: number) => [...timeSlotKeys.details(), id] as const,
};

/** Every claimed/proposed window involving the current user (candidate or landlord). */
export function useMyTimeSlots() {
  return useQuery({
    queryKey: timeSlotKeys.mine(),
    queryFn: () => timeSlotsApi.getMySlots(),
  });
}

/** All slots for a listing (public shape — participant fields are hidden on OPEN rows). */
export function useListingTimeSlots(listingId: number) {
  return useQuery({
    queryKey: timeSlotKeys.byListing(listingId),
    queryFn: () => timeSlotsApi.getByListingId(listingId),
    enabled: !!listingId,
  });
}

/** Only the still-bookable (OPEN + future) windows for a listing. */
export function useAvailableTimeSlots(
  listingId: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: timeSlotKeys.available(listingId),
    queryFn: () => timeSlotsApi.getAvailableByListingId(listingId),
    enabled: !!listingId && (options?.enabled ?? true),
  });
}

/** Claimed/proposed windows for a listing (landlord only). */
export function useListingBookings(listingId: number) {
  return useQuery({
    queryKey: timeSlotKeys.bookings(listingId),
    queryFn: () => timeSlotsApi.getBookingsByListingId(listingId),
    enabled: !!listingId,
  });
}

export function useTimeSlot(id: number) {
  return useQuery({
    queryKey: timeSlotKeys.detail(id),
    queryFn: () => timeSlotsApi.getById(id),
    enabled: !!id,
  });
}

/** Landlord: publish a new OPEN availability window. */
export function useCreateTimeSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimeSlotRequest) => timeSlotsApi.create(data),
    onSuccess: (_, { listingId }) => {
      queryClient.invalidateQueries({
        queryKey: timeSlotKeys.byListing(listingId),
      });
      queryClient.invalidateQueries({
        queryKey: timeSlotKeys.available(listingId),
      });
    },
  });
}

/** Candidate: request a viewing at a custom time. */
export function useProposeTimeSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimeSlotRequest) => timeSlotsApi.propose(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
    },
  });
}

/** Candidate: claim an OPEN window; it becomes a PENDING booking. */
export function useClaimTimeSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ClaimTimeSlotRequest }) =>
      timeSlotsApi.claim(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
    },
  });
}

export function useUpdateTimeSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTimeSlotRequest }) =>
      timeSlotsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(timeSlotKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
    },
  });
}

export function useDeleteTimeSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => timeSlotsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
    },
  });
}
