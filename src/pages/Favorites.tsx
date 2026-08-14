import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Pagination, ErrorState, EmptyState, InlineSpinner } from "@/components/shared";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMyFavorites, favoritesKeys } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { getLocalizedTitle } from "@/types/listing";
import { formatPrice, formatArea } from "@/utils/format";
import placeholderImage from "@/assets/property-1.jpg";

const Favorites = () => {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useMyFavorites({ page, limit: 12 });

  const listings = data?.data ?? [];
  const pagination = data?.pagination;

  const handleFavoriteChange = (_id: number, isFavorite: boolean) => {
    if (!isFavorite) {
      // PropertyCard already removed the favorite; refresh the list.
      queryClient.invalidateQueries({ queryKey: favoritesKeys.list() });
    }
  };

  return (
    <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t("favorites.title")}
              </h1>
              <p className="text-muted-foreground">{t("favorites.subtitle")}</p>
            </div>
            {listings.length > 0 && pagination && (
              <p className="text-muted-foreground mt-4 sm:mt-0">
                {pagination.total} {pagination.total === 1 ? t("favorites.property") : t("favorites.properties")}
              </p>
            )}
          </div>

          {isLoading && <InlineSpinner />}

          {error && !isLoading && (
            <ErrorState message={t("favorites.errorLoading")} onRetry={() => refetch()} />
          )}

          {!isLoading && !error && listings.length === 0 && (
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

          {!isLoading && !error && listings.length > 0 && (
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

              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </PageLayout>
  );
};

export default Favorites;
