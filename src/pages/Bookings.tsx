import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Clock, MapPin, Home, Trash2, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { InlineSpinner, BookingStatusBadge, ConfirmDialog } from "@/components/shared";
import { formatDateTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/lib/toast";
import { bookingsApi } from "@/api/bookings";
import { listingsApi } from "@/api/listings";
import { bookingKeys, useDeleteBooking } from "@/hooks";
import type { Listing } from "@/types";
import { getLocalizedTitle } from "@/types/listing";
import placeholderImage from "@/assets/property-1.jpg";

const Bookings = () => {
  const { t, tt, language, locale } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: async () => {
      const allBookings = await bookingsApi.getAll();
      const listingIds = [...new Set(allBookings.map((b) => b.listingId))];
      const listingResults = await Promise.allSettled(
        listingIds.map((id) => listingsApi.getById(id)),
      );
      const listings: Record<number, Listing> = {};
      listingIds.forEach((id, i) => {
        const result = listingResults[i];
        if (result.status === "fulfilled") listings[id] = result.value;
      });
      return { bookings: allBookings, listings };
    },
  });

  const deleteMutation = useDeleteBooking();
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  const bookings = data?.bookings ?? [];
  const listings = data?.listings ?? {};

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      await deleteMutation.mutateAsync(cancelTarget);
      toast({ title: t("bookings.cancelled") });
    } catch (err) {
      toast({ title: t("bookings.cancelFailed"), variant: "destructive" });
    } finally {
      setCancelTarget(null);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <InlineSpinner />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold">{t("bookings.title")}</h1>
            <CalendarClock className="h-8 w-8 text-primary" />
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">{t("bookings.errorLoading")}</p>
              </CardContent>
            </Card>
          )}

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarClock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">{t("bookings.noBookings")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t("bookings.noBookingsDesc")}
                </p>
                <Link to="/search">
                  <Button>{t("bookings.browseListings")}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const listing = listings[booking.listingId];
                return (
                  <Card
                    key={booking.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <img
                          src={listing?.images?.[0]?.url || placeholderImage}
                          alt={listing ? getLocalizedTitle(listing, language) : ""}
                          className="w-32 h-32 object-cover rounded-lg"
                        />

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link
                                to={`/listings/${booking.listingId}`}
                                className="text-lg font-semibold hover:text-primary transition-colors"
                              >
                                {listing ? getLocalizedTitle(listing, language) : t("bookings.unknownListing")}
                              </Link>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{listing?.city}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Home className="h-4 w-4" />
                                  <span>{tt("common.pricePerMonth", { price: listing?.price ?? 0 })}</span>
                                </div>
                              </div>
                            </div>
                            <BookingStatusBadge status={booking.status} />
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {formatDateTime(booking.scheduledAt, locale)}
                              </span>
                            </div>
                          </div>

                          {booking.meetLink && (
                            <div>
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={booking.meetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <Video className="h-4 w-4" />
                                  {t("bookings.joinVideoCall")}
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {booking.status === "PENDING" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setCancelTarget(booking.id)}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              {t("bookings.cancel")}
                            </Button>
                          )}
                          <Link to={`/bookings/${booking.id}`}>
                            <Button variant="ghost" size="sm">
                              {t("bookings.viewDetails")}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title={t("bookings.cancel")}
        description={t("bookings.cancelConfirm")}
        onConfirm={handleConfirmCancel}
        confirmLabel={t("bookings.cancel")}
        destructive
        isLoading={deleteMutation.isPending}
      />
    </PageLayout>
  );
};

const BookingsPage = () => <Bookings />;

export default BookingsPage;
