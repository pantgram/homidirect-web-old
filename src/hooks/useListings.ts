import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listingsApi,
  type UpdateListingRequest,
  type ListingsQueryParams,
  type CreateListingWithSessionRequest,
} from "@/api";

export const listingKeys = {
  all: ["listings"] as const,
  lists: () => [...listingKeys.all, "list"] as const,
  list: (params?: ListingsQueryParams) =>
    [...listingKeys.lists(), params] as const,
  details: () => [...listingKeys.all, "detail"] as const,
  detail: (id: number) => [...listingKeys.details(), id] as const,
  images: (listingId: number) =>
    [...listingKeys.detail(listingId), "images"] as const,
};

export function useListings(params?: ListingsQueryParams) {
  return useQuery({
    queryKey: listingKeys.list(params),
    queryFn: () => listingsApi.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useListing(id: number) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => listingsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListingWithSessionRequest) => listingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateListingRequest }) =>
      listingsApi.update(id, data),
    onSuccess: (updatedListing) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      queryClient.setQueryData(
        listingKeys.detail(updatedListing.id),
        updatedListing
      );
    },
  });
}

// Listing images hooks
export function useListingImages(listingId: number) {
  return useQuery({
    queryKey: listingKeys.images(listingId),
    queryFn: () => listingsApi.getImages(listingId),
    enabled: !!listingId,
  });
}

export function useUploadListingImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, file }: { listingId: number; file: File }) =>
      listingsApi.uploadImage(listingId, file),
    onSuccess: (_, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.images(listingId) });
    },
  });
}

export function useDeleteListingImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listingId,
      imageId,
    }: {
      listingId: number;
      imageId: number;
    }) => listingsApi.deleteImage(listingId, imageId),
    onSuccess: (_, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.images(listingId) });
    },
  });
}
