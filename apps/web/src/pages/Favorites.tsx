import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Heart, Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { favoritesApi } from "@/api/favorites";
import type { ListingSearchResult, PropertyType } from "@/api/types";
import { getLocalizedTitle } from "@/types/listing";
import placeholderImage from "@/assets/property-1.jpg";

const Favorites = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

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
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        navigate("/auth");
        return;
      }
      fetchFavorites();
    }
  }, [isAuthLoading, isAuthenticated, navigate, fetchFavorites]);

  const handlePageChange = (page: number) => {
    fetchFavorites(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFavoriteChange = (id: number, isFavorite: boolean) => {
    // If unfavorited, remove from list
    if (!isFavorite) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} m²`;
  };

  const getPropertyTypeLabel = (type: PropertyType) => {
    const labels: Record<PropertyType, string> = {
      apartment: t("search.apartment"),
      house: t("search.house"),
      studio: t("search.studio"),
      room: t("search.room"),
    };
    return labels[type] || type;
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => fetchFavorites()} className="mt-4">
              {t("common.tryAgain")}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && listings.length === 0 && (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-medium text-foreground mb-2">
              {t("favorites.noFavorites")}
            </p>
            <p className="text-muted-foreground mb-6">
              {t("favorites.saveSome")}
            </p>
            <Link to="/search">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                {t("favorites.browseListings")}
              </Button>
            </Link>
          </div>
        )}

        {/* Listings Grid */}
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  {t("search.previous")}
                </Button>
                {Array.from(
                  { length: Math.min(pagination.totalPages, 5) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
                <Button
                  variant="outline"
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  {t("search.next")}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
