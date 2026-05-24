import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { listingsApi } from "@/api/listings";
import { useFavorites } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { getLocalizedTitle } from "@/types/listing";
import placeholderImage from "@/assets/property-1.jpg";

const PropertyCardSkeleton = () => (
  <div className="rounded-lg border border-border overflow-hidden">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  </div>
);

const Index = () => {
  const { t, language } = useLanguage();
  const { favoriteIds, handleFavoriteChange } = useFavorites();

  const { data: listingsResponse, isLoading } = useQuery({
    queryKey: ["featuredListings"],
    queryFn: async () => {
      // First try to get featured listings
      const featured = await listingsApi.search({ isFeatured: true, limit: 8 });
      if (featured.data.length > 0) {
        return featured;
      }
      // Fall back to newest listings if no featured ones
      return listingsApi.search({ sortBy: "newest", limit: 8 });
    },
  });

  const properties = listingsResponse?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />

      {/* Featured Properties Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t("home.featuredProperties")}
              </h2>
              <p className="text-muted-foreground">{t("home.handPicked")}</p>
            </div>
            <Button
              asChild
              variant="ghost"
              className="hidden md:flex items-center gap-2"
            >
              <Link to="/search">
                {t("home.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <>
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
              </>
            ) : properties.length > 0 ? (
              properties.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  id={listing.id}
                  image={listing.primaryImage?.url || placeholderImage}
                  title={getLocalizedTitle(listing, language)}
                  location={listing.city}
                  price={listing.price.toLocaleString()}
                  bedrooms={listing.bedrooms}
                  bathrooms={listing.bathrooms}
                  area={`${listing.area.toLocaleString()} sq ft`}
                  propertyType={listing.propertyType}
                  featured={listing.isFeatured}
                  isFavorite={favoriteIds.has(listing.id)}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-8">
                {t("home.noListingsYet")}
              </p>
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link to="/search">
                {t("home.viewAllProperties")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t("home.whyChoose")}
            </h2>
            <p className="text-muted-foreground">{t("home.whyChooseDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-card-hover transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {t("home.noAgentFees")}
              </h3>
              <p className="text-muted-foreground">
                {t("home.noAgentFeesDesc")}
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-card-hover transition-shadow">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {t("home.verifiedListings")}
              </h3>
              <p className="text-muted-foreground">
                {t("home.verifiedListingsDesc")}
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-card-hover transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {t("home.directCommunication")}
              </h3>
              <p className="text-muted-foreground">
                {t("home.directCommunicationDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
