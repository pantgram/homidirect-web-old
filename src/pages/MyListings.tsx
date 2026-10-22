import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
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
import { toast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMyListings, useDeleteListing } from "@/hooks";
import { getLocalizedTitle } from "@/types/listing";
import placeholderImage from "@/assets/property-1.jpg";

const MyListings = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<number | null>(null);

  const { data, isLoading, error, refetch } = useMyListings({ page, limit: 12 });
  const deleteMutation = useDeleteListing();

  const listings = data?.data ?? [];
  const pagination = data?.pagination;

  const handleDeleteClick = (listingId: number) => {
    setListingToDelete(listingId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return;

    try {
      await deleteMutation.mutateAsync(listingToDelete);
      toast({ title: t("myListings.deleteSuccess") });
    } catch (err) {
      toast({ title: t("myListings.deleteFailed"), variant: "destructive" });
    } finally {
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

          {isLoading && <InlineSpinner />}

          {error && !isLoading && (
            <ErrorState
              message={t("myListings.errorLoading")}
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !error && listings.length === 0 && (
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

          {!isLoading && !error && listings.length > 0 && (
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
                          listing.publicationStatus === "DRAFT"
                            ? "bg-gray-500 text-white"
                            : "bg-green-500 text-white"
                        }
                      >
                        {listing.publicationStatus === "DRAFT"
                          ? t("myListings.unavailable")
                          : t("myListings.available")}
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

              {pagination && (
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

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={t("myListings.delete")}
          description={t("myListings.confirmDelete")}
          onConfirm={handleDeleteConfirm}
          confirmLabel={t("myListings.delete")}
          destructive
          isLoading={deleteMutation.isPending}
        />
      </PageLayout>
  );
};

export default MyListings;
