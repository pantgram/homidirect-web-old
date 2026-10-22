import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listingsApi,
  type UpdateListingRequest,
  type CreateListingRequest,
  type SearchListingsParams,
} from "@/api";

export const listingKeys = {
  all: ["listings"] as const,
  lists: () => [...listingKeys.all, "list"] as const,
  list: () => [...listingKeys.lists()] as const,
  myListings: (params?: { page?: number; limit?: number }) =>
    [...listingKeys.lists(), "my", params] as const,
  search: (params?: SearchListingsParams) =>
    [...listingKeys.lists(), "search", params] as const,
  featured: () => [...listingKeys.lists(), "featured"] as const,
  details: () => [...listingKeys.all, "detail"] as const,
  detail: (id: number) => [...listingKeys.details(), id] as const,
  images: (listingId: number) =>
    [...listingKeys.detail(listingId), "images"] as const,
};

export function useListings() {
  return useQuery({
    queryKey: listingKeys.list(),
    queryFn: () => listingsApi.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useMyListings(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: listingKeys.myListings(params),
    queryFn: () => listingsApi.getMyListings(params),
  });
}

export function useSearchListings(params?: SearchListingsParams) {
  return useQuery({
    queryKey: listingKeys.search(params),
    queryFn: () => listingsApi.search(params),
  });
}

export function useFeaturedListings() {
  return useQuery({
    queryKey: listingKeys.featured(),
    queryFn: async () => {
      const featured = await listingsApi.search({ isFeatured: true, limit: 8 });
      if (featured.data.length > 0) return featured;
      return listingsApi.search({ sortBy: "newest", limit: 8 });
    },
    staleTime: 5 * 60 * 1000,
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
    mutationFn: (data: CreateListingRequest) => listingsApi.create(data),
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

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => listingsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      queryClient.removeQueries({ queryKey: listingKeys.detail(id) });
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

export function useListingCoverImage(listingId: number) {
  return useQuery({
    queryKey: [...listingKeys.images(listingId), "cover"] as const,
    queryFn: async () => {
      const images = await listingsApi.getImages(listingId);
      return images[0]?.url ?? null;
    },
    enabled: !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
