import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Pagination, ErrorState, EmptyState, InlineSpinner } from "@/components/shared";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { favoritesApi } from "@/api/favorites";
import type { ListingSearchResult } from "@/api/types";
import { getLocalizedTitle } from "@/types/listing";
import { formatPrice, formatArea } from "@/utils/format";
import placeholderImage from "@/assets/property-1.jpg";

const Favorites = () => {
  const { t, language } = useLanguage();

  const [listings, setListings] = useState<ListingSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchFavorites = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const response = await favoritesApi.getMyFavorites({ page, limit: 12 });
        setListings(response.data);
        setPagination({
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
          hasNextPage: response.pagination.hasNextPage,
          hasPreviousPage: response.pagination.hasPreviousPage,
        });
      } catch (err) {
        setError(t("favorites.errorLoading"));
        console.error("Failed to fetch favorites:", err);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handlePageChange = (page: number) => {
    fetchFavorites(page);
  };

  const handleFavoriteChange = (id: number, isFavorite: boolean) => {
    if (!isFavorite) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    }
  };

  return (
    <RequireAuth>
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t("favorites.title")}
              </h1>
              <p className="text-muted-foreground">{t("favorites.subtitle")}</p>
            </div>
            {listings.length > 0 && (
              <p className="text-muted-foreground mt-4 sm:mt-0">
                {pagination.total} {pagination.total === 1 ? t("favorites.property") : t("favorites.properties")}
              </p>
            )}
          </div>

          {loading && <InlineSpinner />}

          {error && !loading && (
            <ErrorState message={error || ""} onRetry={() => fetchFavorites()} />
          )}

          {!loading && !error && listings.length === 0 && (
            <EmptyState
              icon={Heart}
              title={t("favorites.noFavorites")}
              description={t("favorites.saveSome")}
              action={
                <Link to="/search">
                  <Button><Search className="h-4 w-4 mr-2" />{t("favorites.browseListings")}</Button>
                </Link>
              }
            />
          )}

          {!loading && !error && listings.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {listings.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    id={listing.id}
                    image={listing.primaryImage?.url || placeholderImage}
                    title={getLocalizedTitle(listing, language)}
                    location={listing.city}
                    price={formatPrice(listing.price)}
                    bedrooms={listing.bedrooms}
                    bathrooms={listing.bathrooms}
                    area={formatArea(listing.area)}
                    propertyType={listing.propertyType}
                    featured={listing.isFeatured}
                    isFavorite={true}
                    onFavoriteChange={handleFavoriteChange}
                  />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </PageLayout>
    </RequireAuth>
  );
};

export default Favorites;
