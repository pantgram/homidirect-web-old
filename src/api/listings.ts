import { apiClient } from "./client";
import type {
  Listing,
  CreateListingRequest,
  UpdateListingRequest,
  ListingImage,
  SearchListingsParams,
  ListingSearchResult,
  PaginatedResponse,
} from "@/types";

export interface PlatformStats {
  activeListingsCount: number;
  propertyOwnersCount: number;
}

export interface ContactOwnerRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const listingsApi = {
  async getStats(): Promise<PlatformStats> {
    const response = await apiClient.get<PlatformStats>("/listings/stats");
    return response.data;
  },

  async getCities(): Promise<string[]> {
    const response = await apiClient.get<string[]>("/listings/cities");
    return response.data;
  },

  async getAll(): Promise<Listing[]> {
    const response = await apiClient.get<{ listings: Listing[] }>("/listings/");
    return response.data.listings;
  },

  async getMyListings(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ListingSearchResult>> {
    const response = await apiClient.get<
      PaginatedResponse<ListingSearchResult>
    >("/listings/my-listings", { params });
    return response.data;
  },

  async search(
    params?: SearchListingsParams
  ): Promise<PaginatedResponse<ListingSearchResult>> {
    const response = await apiClient.get<
      PaginatedResponse<ListingSearchResult>
    >("/listings/search", { params });
    return response.data;
  },

  async getById(id: number): Promise<Listing> {
    const response = await apiClient.get<{ listing: Listing }>(
      `/listings/${id}`
    );
    return response.data.listing;
  },

  async create(data: CreateListingRequest): Promise<Listing> {
    const response = await apiClient.post<{ listing: Listing }>(
      "/listings/",
      data
    );
    return response.data.listing;
  },

  async update(id: number, data: UpdateListingRequest): Promise<Listing> {
    const response = await apiClient.patch<{ listing: Listing }>(
      `/listings/${id}`,
      data
    );
    return response.data.listing;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/listings/${id}`);
  },

  async getImages(listingId: number): Promise<ListingImage[]> {
    const response = await apiClient.get<{ images: ListingImage[] }>(
      `/listings/${listingId}/images`
    );
    return response.data.images;
  },

  async uploadImage(listingId: number, file: File): Promise<ListingImage> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ image: ListingImage }>(
      `/listings/${listingId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.image;
  },

  async deleteImage(listingId: number, imageId: number): Promise<void> {
    await apiClient.delete(`/listings/${listingId}/images/${imageId}`);
  },

  async contactOwner(
    listingId: number,
    data: ContactOwnerRequest
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/listings/${listingId}/contact`,
      data
    );
    return response.data;
  },
};
