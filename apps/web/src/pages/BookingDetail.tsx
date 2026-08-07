import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Home,
  Video,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BackButton } from "@/components/shared/BackButton";
import { BookingStatusBadge } from "@/components/shared/BookingStatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InlineSpinner } from "@/components/shared";
import { formatDateTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";
import { bookingsApi } from "@/api/bookings";
import { listingsApi } from "@/api/listings";
import type { Booking, Listing, ListingImage } from "@/types";
import { getLocalizedTitle } from "@/types/listing";
import placeholderImage from "@/assets/property-1.jpg";

interface ListingWithImages extends Listing {
  images?: ListingImage[];
}

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language, locale } = useLanguage();
  const { user } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [listing, setListing] = useState<ListingWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const bookingData = await bookingsApi.getById(parseInt(id));
        setBooking(bookingData);

        try {
          const listingData = await listingsApi.getById(bookingData.listingId);
          const images = await listingsApi.getImages(bookingData.listingId);
          setListing({ ...listingData, images });
        } catch (listingErr) {
          // Failed to fetch listing details
        }
      } catch (err) {
        // Failed to fetch booking
        setError(t("bookingDetail.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, t]);

  const handleUpdateStatus = async (status: "CONFIRMED" | "DECLINED") => {
    if (!booking) return;

    setUpdating(true);
    try {
      const updated = await bookingsApi.update(booking.id, { status });
      setBooking(updated);
      toast({
        title:
          status === "CONFIRMED"
            ? t("bookingDetail.bookingConfirmed")
            : t("bookingDetail.bookingDeclined"),
      });
    } catch (err) {
      toast({
        title: t("bookingDetail.updateFailed"),
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!booking) return;

    setShowCancelDialog(false);
    try {
      await bookingsApi.delete(booking.id);
      toast({
        title: t("bookingDetail.bookingCancelled"),
      });
      navigate("/bookings");
    } catch (err) {
      toast({
        title: t("bookingDetail.cancelFailed"),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <InlineSpinner />
      </PageLayout>
    );
  }

  if (error || !booking) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || t("bookingDetail.notFound")}
          </h1>
          <Button onClick={() => navigate("/bookings")}>
            {t("bookingDetail.backToBookings")}
          </Button>
        </div>
      </PageLayout>
    );
  }

  const isLandlord = user?.id === booking.landlordId;
  const canCancel = booking.status === "PENDING";

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <BackButton label={t("bookingDetail.back")} />

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t("bookingDetail.title")}</h1>
              <BookingStatusBadge status={booking.status} />
            </div>
            {canCancel && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t("bookingDetail.cancelBooking")}
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <img
                  src={listing?.images?.[0]?.url || placeholderImage}
                  alt={listing ? getLocalizedTitle(listing, language) : ""}
                  className="w-48 h-36 object-cover rounded-lg"
                />

                <div className="flex-1 space-y-3">
                  <div>
                    <Link
                      to={`/listings/${listing?.id}`}
                      className="text-xl font-semibold hover:text-primary transition-colors"
                    >
                      {listing ? getLocalizedTitle(listing, language) : t("bookingDetail.unknownListing")}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{listing?.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        <span>{t("common.pricePerMonth").replace("{price}", String(listing?.price))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t("bookingDetail.viewingSchedule")}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("bookingDetail.dateAndTime")}</p>
                    <p className="text-lg font-medium">
                      {formatDateTime(booking.scheduledAt, locale, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {booking.meetLink && booking.status === "CONFIRMED" && (
                  <div className="mt-6">
                    <Button asChild className="w-full sm:w-auto">
                      <a
                        href={booking.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        {t("bookingDetail.joinVideoCall")}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isLandlord && booking.status === "PENDING" && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t("bookingDetail.actions")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t("bookingDetail.reviewRequest")}
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleUpdateStatus("CONFIRMED")}
                    disabled={updating}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {t("bookingDetail.confirmBooking")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus("DECLINED")}
                    disabled={updating}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    {t("bookingDetail.declineBooking")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title={t("bookingDetail.cancelBooking")}
        description={t("bookingDetail.cancelConfirm")}
        onConfirm={handleDelete}
        confirmLabel={t("bookingDetail.yesCancel")}
        cancelLabel={t("bookingDetail.noKeepIt")}
        destructive
      />
    </PageLayout>
  );
};

export default BookingDetail;
