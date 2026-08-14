import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { favoritesApi } from "@/api/favorites";

export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFavoriteIds = async () => {
      if (!isAuthenticated) {
        setFavoriteIds(new Set());
        return;
      }
      setIsLoading(true);
      try {
        const ids = await favoritesApi.getFavoriteIds();
        setFavoriteIds(new Set(ids));
      } catch {
        // ignore — favorites set is best-effort
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavoriteIds();
  }, [isAuthenticated]);

  const handleFavoriteChange = useCallback(
    (id: number, isFavorite: boolean) => {
      setFavoriteIds((prev) => {
        const newSet = new Set(prev);
        if (isFavorite) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
    },
    []
  );

  const isFavorite = useCallback(
    (id: number) => favoriteIds.has(id),
    [favoriteIds]
  );

  return {
    favoriteIds,
    isLoading,
    handleFavoriteChange,
    isFavorite,
  };
};
