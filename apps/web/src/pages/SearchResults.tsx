import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { listingsApi } from "@/api/listings";
import { useFavorites } from "@/hooks";
import type {
  SearchListingsParams,
  ListingSearchResult,
  PropertyType,
} from "@/types";
import { getLocalizedTitle } from "@/types/listing";
import { PageLayout } from "@/components/layout/PageLayout";
import { Pagination, ErrorState, InlineSpinner } from "@/components/shared";
import { formatPrice, formatArea } from "@/utils/format";
import placeholderImage from "@/assets/property-1.jpg";

const PROPERTY_TYPES = ["apartment", "house", "studio", "room"] as const;

const SearchResults = () => {
  const { t, language } = useLanguage();
  const { favoriteIds, handleFavoriteChange } = useFavorites();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showFilters, setShowFilters] = useState(
    () => !!searchParams.get("type")
  );
  const [minPrice, setMinPrice] = useState(
    () => searchParams.get("minPrice") || ""
  );
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams.get("maxPrice") || ""
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || ""
  );
  const [propertyType, setPropertyType] = useState<PropertyType | "all">(() => {
    const type = searchParams.get("type");
    return type && PROPERTY_TYPES.includes(type as PropertyType)
      ? (type as PropertyType)
      : "all";
  });
  const [minBedrooms, setMinBedrooms] = useState<string>(
    () => searchParams.get("bedrooms") || "all"
  );
  const [minBathrooms, setMinBathrooms] = useState<string>(
    () => searchParams.get("bathrooms") || "all"
  );
  const [sortBy, setSortBy] = useState<SearchListingsParams["sortBy"]>(() => {
    const sort = searchParams.get("sort");
    return (sort as SearchListingsParams["sortBy"]) || "featured";
  });

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

  const fetchListings = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const params: SearchListingsParams = {
          page,
          limit: 12,
          sortBy,
          available: true,
        };

        if (searchQuery) params.q = searchQuery;
        if (propertyType !== "all") params.propertyType = propertyType;
        if (minBedrooms !== "all") params.minBedrooms = parseInt(minBedrooms);
        if (minBathrooms !== "all")
          params.minBathrooms = parseInt(minBathrooms);
        if (minPrice) params.minPrice = parseInt(minPrice);
        if (maxPrice) params.maxPrice = parseInt(maxPrice);

        const response = await listingsApi.search(params);
        setListings(response.data);
        setPagination({
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
          hasNextPage: response.pagination.hasNextPage,
          hasPreviousPage: response.pagination.hasPreviousPage,
        });
      } catch (err) {
        setError(t("search.errorLoading"));
      } finally {
        setLoading(false);
      }
    },
    [
      searchQuery,
      propertyType,
      minBedrooms,
      minBathrooms,
      minPrice,
      maxPrice,
      sortBy,
      t,
    ]
  );

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (propertyType !== "all") params.set("type", propertyType);
    if (minBedrooms !== "all") params.set("bedrooms", minBedrooms);
    if (minBathrooms !== "all") params.set("bathrooms", minBathrooms);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sortBy && sortBy !== "featured") params.set("sort", sortBy);
    setSearchParams(params);

    fetchListings(1);
  };

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t("search.placeholder")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {t("search.filters")}
            </Button>
            <Button className="md:w-auto" onClick={handleSearch}>
              {t("search.search")}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {t("search.propertyType")}
                  </label>
                  <Select
                    value={propertyType}
                    onValueChange={(value) =>
                      setPropertyType(value as PropertyType | "all")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("search.allTypes")}
                      </SelectItem>
                      <SelectItem value="apartment">
                        {t("search.apartment")}
                      </SelectItem>
                      <SelectItem value="house">{t("search.house")}</SelectItem>
                      <SelectItem value="studio">
                        {t("search.studio")}
                      </SelectItem>
                      <SelectItem value="room">{t("search.room")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {t("search.bedrooms")}
                  </label>
                  <Select value={minBedrooms} onValueChange={setMinBedrooms}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("search.bedrooms")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("search.any")}</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {t("search.bathrooms")}
                  </label>
                  <Select value={minBathrooms} onValueChange={setMinBathrooms}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("search.bathrooms")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("search.any")}</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t("search.priceRange")}
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder={t("search.minPrice")}
                      value={minPrice}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d+$/.test(value)) {
                          setMinPrice(value);
                        }
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground">-</span>
                  <div className="flex-1">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder={t("search.maxPrice")}
                      value={maxPrice}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d+$/.test(value)) {
                          setMaxPrice(value);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("search.results")}
            </h1>
            <p className="text-muted-foreground">
              {t("search.foundProperties")
                .replace("{count}", pagination.total.toString())
                .replace("{location}", searchQuery || t("search.allLocations"))}
            </p>
          </div>
          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as SearchListingsParams["sortBy"])
            }
          >
            <SelectTrigger className="w-[200px] mt-4 sm:mt-0">
              <SelectValue placeholder={t("search.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">
                {t("search.featuredFirst")}
              </SelectItem>
              <SelectItem value="price_asc">
                {t("search.priceLowToHigh")}
              </SelectItem>
              <SelectItem value="price_desc">
                {t("search.priceHighToLow")}
              </SelectItem>
              <SelectItem value="newest">{t("search.newestFirst")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && <InlineSpinner />}

        {!loading && error && (
          <ErrorState message={error} onRetry={() => fetchListings()} />
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("search.noResults")}</p>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
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
                isFavorite={favoriteIds.has(listing.id)}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            onPageChange={(page) => fetchListings(page)}
          />
        )}
      </main>
    </PageLayout>
  );
};

export default SearchResults;
