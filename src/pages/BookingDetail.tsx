import { useState } from "react";
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
import { TimeSlotStatusBadge } from "@/components/shared/TimeSlotStatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InlineSpinner } from "@/components/shared";
import { formatDateTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";
import {
  useTimeSlot,
  useListing,
  useListingImages,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
} from "@/hooks";
import type { Listing, ListingImage, TimeSlotStatus } from "@/types";
import { getLocalizedTitle } from "@/types/listing";
import placeholderImage from "@/assets/property-1.jpg";

interface ListingWithImages extends Listing {
  images?: ListingImage[];
}

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, tt, language, locale } = useLanguage();
  const { user } = useAuth();

  const slotId = id ? parseInt(id, 10) : 0;
  const { data: slot, isLoading, error } = useTimeSlot(slotId);
  const listingId = slot?.listingId ?? 0;
  const { data: listingData } = useListing(listingId);
  const { data: images } = useListingImages(listingId);

  const listing: ListingWithImages | null = listingData
    ? { ...listingData, images: images ?? [] }
    : null;

  const updateMutation = useUpdateTimeSlot();
  const deleteMutation = useDeleteTimeSlot();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleUpdateStatus = async (status: Extract<TimeSlotStatus, "CONFIRMED" | "DECLINED">) => {
    if (!slot) return;

    try {
      await updateMutation.mutateAsync({ id: slot.id, data: { status } });
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
    }
  };

  const handleDelete = async () => {
    if (!slot) return;

    setShowCancelDialog(false);
    try {
      await deleteMutation.mutateAsync(slot.id);
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

  if (isLoading) {
    return (
      <PageLayout>
        <InlineSpinner />
      </PageLayout>
    );
  }

  if (error || !slot) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error ? t("bookingDetail.errorLoading") : t("bookingDetail.notFound")}
          </h1>
          <Button onClick={() => navigate("/bookings")}>
            {t("bookingDetail.backToBookings")}
          </Button>
        </div>
      </PageLayout>
    );
  }

  const isLandlord = user?.id === slot.landlordId;
  const canCancel = slot.status === "PENDING" || slot.status === "CONFIRMED";

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <BackButton label={t("bookingDetail.back")} />

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t("bookingDetail.title")}</h1>
              <TimeSlotStatusBadge status={slot.status} />
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
                        <span>{tt("common.pricePerMonth", { price: listing?.price ?? 0 })}</span>
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
                      {formatDateTime(slot.startTime, locale, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(slot.startTime).toLocaleTimeString(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(slot.endTime).toLocaleTimeString(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {slot.type === "REMOTE" ? (
                    <Video className="h-5 w-5 text-primary" />
                  ) : (
                    <MapPin className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">{t("availabilitySlots.slotType")}</p>
                    <p className="font-medium">
                      {slot.type === "REMOTE"
                        ? t("availabilitySlots.typeRemote")
                        : t("availabilitySlots.typeOnSite")}
                    </p>
                  </div>
                </div>

                {slot.meetLink && slot.status === "CONFIRMED" && (
                  <div className="mt-6">
                    <Button asChild className="w-full sm:w-auto">
                      <a
                        href={slot.meetLink}
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

          {isLandlord && slot.status === "PENDING" && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t("bookingDetail.actions")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t("bookingDetail.reviewRequest")}
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleUpdateStatus("CONFIRMED")}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {t("bookingDetail.confirmBooking")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus("DECLINED")}
                    disabled={updateMutation.isPending}
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
