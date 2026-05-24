import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Loader2, Building2, Pencil, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { listingsApi } from "@/api/listings";
import type { ListingSearchResult } from "@/api/types";
import { getLocalizedTitle } from "@/types/listing";
import placeholderImage from "@/assets/property-1.jpg";

const MyListings = () => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canAccess =
    user?.role === "LANDLORD" ||
    user?.role === "ADMIN" ||
    user?.role === "BOTH";

  const fetchListings = useCallback(
    async (page = 1) => {
      if (!canAccess) return;

      setLoading(true);
      setError(null);

      try {
        const response = await listingsApi.getMyListings({ page, limit: 12 });
        setListings(response.data);
        setPagination({
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
          hasNextPage: response.pagination.hasNextPage,
          hasPreviousPage: response.pagination.hasPreviousPage,
        });
      } catch (err) {
        setError(t("myListings.errorLoading"));
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    },
    [canAccess, t],
  );

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        navigate("/auth");
        return;
      }
      if (!canAccess) {
        toast({
          title: t("myListings.landlordRequired"),
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      fetchListings();
    }
  }, [
    isAuthLoading,
    isAuthenticated,
    canAccess,
    navigate,
    toast,
    t,
    fetchListings,
  ]);

  const handlePageChange = (page: number) => {
    fetchListings(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (listingId: number) => {
    setListingToDelete(listingId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return;

    setIsDeleting(true);
    try {
      await listingsApi.delete(listingToDelete);
      toast({
        title: t("myListings.deleteSuccess"),
      });
      setListings((prev) => prev.filter((l) => l.id !== listingToDelete));
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (err) {
      toast({
        title: t("myListings.deleteFailed"),
        variant: "destructive",
      });
      console.error("Failed to delete listing:", err);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} m²`;
  };

  const getVerificationBadge = (status: string | undefined) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="bg-green-500 text-white">
            {t("myListings.verified")}
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-500 text-white">
            {t("myListings.pending")}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-500 text-white">
            {t("myListings.rejected")}
          </Badge>
        );
      default:
        return null;
    }
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
              {t("myListings.title")}
            </h1>
            <p className="text-muted-foreground">{t("myListings.subtitle")}</p>
          </div>
          <Link to="/list-property">
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              {t("nav.list")}
            </Button>
          </Link>
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
            <Button onClick={() => fetchListings()} className="mt-4">
              {t("common.tryAgain")}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && listings.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">
              {t("myListings.noListings")}
            </p>
            <Link to="/list-property">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("myListings.createFirst")}
              </Button>
            </Link>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && !error && listings.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {listings.map((listing) => (
                <div key={listing.id} className="relative group">
                  <PropertyCard
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
                  />
                  {/* Status badges and action buttons overlay */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {getVerificationBadge(listing.verificationStatus)}
                    <Badge
                      className={
                        listing.available
                          ? "bg-green-500 text-white"
                          : "bg-gray-500 text-white"
                      }
                    >
                      {listing.available
                        ? t("myListings.available")
                        : t("myListings.unavailable")}
                    </Badge>
                  </div>
                  {/* Action buttons */}
                  <div className="absolute bottom-4 right-4 flex gap-2 transition-opacity z-10">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/listings/${listing.id}/edit`);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick(listing.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
                        variant={
                          pagination.page === pageNum ? "default" : "outline"
                        }
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  },
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("myListings.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("myListings.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("common.tryAgain").replace("Try Again", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("myListings.delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default MyListings;
