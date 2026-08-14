import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { availabilitySlotsApi } from "@/api/availability-slots";
import type { CreateAvailabilitySlotRequest } from "@/types";

export const availabilitySlotKeys = {
  all: ["availability-slots"] as const,
  byListing: (listingId: number, availableOnly = false) =>
    [
      ...availabilitySlotKeys.all,
      "listing",
      listingId,
      { available: availableOnly },
    ] as const,
};

/** All slots for a listing (landlord view). */
export function useAvailabilitySlots(listingId: number) {
  return useQuery({
    queryKey: availabilitySlotKeys.byListing(listingId),
    queryFn: () => availabilitySlotsApi.getByListingId(listingId),
    enabled: !!listingId,
  });
}

/** Only the still-bookable slots for a listing (tenant view). */
export function useAvailableSlots(listingId: number) {
  return useQuery({
    queryKey: availabilitySlotKeys.byListing(listingId, true),
    queryFn: () => availabilitySlotsApi.getAvailableSlotsByListingId(listingId),
    enabled: !!listingId,
  });
}

export function useCreateAvailabilitySlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAvailabilitySlotRequest) =>
      availabilitySlotsApi.create(data),
    onSuccess: (_, { listingId }) => {
      queryClient.invalidateQueries({
        queryKey: availabilitySlotKeys.byListing(listingId),
      });
    },
  });
}

export function useDeleteAvailabilitySlot(listingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotId: number) => availabilitySlotsApi.delete(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: availabilitySlotKeys.byListing(listingId),
      });
    },
  });
}
