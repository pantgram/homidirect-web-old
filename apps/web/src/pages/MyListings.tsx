import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { RequireLandlord } from "@/components/auth/RequireRole";
import {
  Pagination,
  ErrorState,
  EmptyState,
  InlineSpinner,
  ConfirmDialog,
} from "@/components/shared";
import { formatPrice, formatArea } from "@/utils/format";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { listingsApi } from "@/api/listings";
import type { ListingSearchResult } from "@/api/types";
import { getLocalizedTitle } from "@/types/listing";
import placeholderImage from "@/assets/property-1.jpg";

const MyListings = () => {
  const { t, language } = useLanguage();
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

  const fetchListings = useCallback(
    async (page = 1) => {
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
    [t],
  );

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

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

  return (
    <RequireLandlord>
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t("myListings.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("myListings.subtitle")}
              </p>
            </div>
            <Link to="/list-property">
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                {t("nav.list")}
              </Button>
            </Link>
          </div>

          {loading && <InlineSpinner />}

          {error && !loading && (
            <ErrorState
              message={error || ""}
              onRetry={() => fetchListings()}
            />
          )}

          {!loading && !error && listings.length === 0 && (
            <EmptyState
              icon={Building2}
              title={t("myListings.noListings")}
              action={
                <Link to="/list-property">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("myListings.createFirst")}
                  </Button>
                </Link>
              }
            />
          )}

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

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={(page) => fetchListings(page)}
              />
            </>
          )}
        </div>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={t("myListings.delete")}
          description={t("myListings.confirmDelete")}
          onConfirm={handleDeleteConfirm}
          confirmLabel={t("myListings.delete")}
          destructive
          isLoading={isDeleting}
        />
      </PageLayout>
    </RequireLandlord>
  );
};

export default MyListings;
