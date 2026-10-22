import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { favoritesApi } from "@/api/favorites";

export const favoritesKeys = {
  all: ["favorites"] as const,
  ids: () => [...favoritesKeys.all, "ids"] as const,
  list: (params?: { page?: number; limit?: number }) =>
    [...favoritesKeys.all, "list", params] as const,
};

/**
 * The current user's favorited listing IDs as a Set.
 * PropertyCard performs the actual toggle API call and then calls
 * `handleFavoriteChange` to keep this cache in sync (no duplicate request).
 */
export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoriteIds = new Set<number>(), isLoading } = useQuery({
    queryKey: favoritesKeys.ids(),
    queryFn: async () => {
      const ids = await favoritesApi.getFavoriteIds();
      return new Set<number>(ids);
    },
    enabled: isAuthenticated,
  });

  const handleFavoriteChange = useCallback(
    (id: number, isFavorite: boolean) => {
      queryClient.setQueryData<Set<number>>(favoritesKeys.ids(), (prev) => {
        const next = new Set<number>(prev);
        if (isFavorite) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    [queryClient],
  );

  const isFavorite = useCallback(
    (id: number) => favoriteIds.has(id),
    [favoriteIds],
  );

  return {
    favoriteIds,
    isLoading,
    handleFavoriteChange,
    isFavorite,
  };
}

/** Paginated list of the current user's favorited listings. */
export function useMyFavorites(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: favoritesKeys.list(params),
    queryFn: () => favoritesApi.getMyFavorites(params),
  });
}
