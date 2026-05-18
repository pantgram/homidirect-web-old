import { apiClient } from "./client";
import type { ListingSearchResult, PaginatedResponse } from "./types";

export interface FavoriteToggleResponse {
  success: boolean;
  added?: boolean;
  message: string;
}

export interface FavoriteCheckResponse {
  isFavorited: boolean;
}

export interface FavoriteIdsResponse {
  favoriteIds: number[];
}

export const favoritesApi = {
  async getMyFavorites(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ListingSearchResult>> {
    const response = await apiClient.get<
      PaginatedResponse<ListingSearchResult>
    >("/favorites", { params });
    return response.data;
  },

  async getFavoriteIds(): Promise<number[]> {
    const response = await apiClient.get<FavoriteIdsResponse>(
      "/favorites/ids",
    );
    return response.data.favoriteIds;
  },

  async checkFavorite(listingId: number): Promise<boolean> {
    const response = await apiClient.get<FavoriteCheckResponse>(
      `/favorites/${listingId}/check`,
    );
    return response.data.isFavorited;
  },

  async addFavorite(listingId: number): Promise<FavoriteToggleResponse> {
    const response = await apiClient.post<FavoriteToggleResponse>(
      `/favorites/${listingId}`,
    );
    return response.data;
  },

  async removeFavorite(listingId: number): Promise<void> {
    await apiClient.delete(`/favorites/${listingId}`);
  },

  async toggleFavorite(
    listingId: number,
    isFavorited: boolean,
  ): Promise<boolean> {
    if (isFavorited) {
      await this.removeFavorite(listingId);
      return false;
    } else {
      await this.addFavorite(listingId);
      return true;
    }
  },
};
