import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BackButton } from "@/components/shared/BackButton";
import { TimeSlotStatusBadge } from "@/components/shared/TimeSlotStatusBadge";
import { InlineSpinner } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatDateTime } from "@/utils/format";
import TimeSlotForm from "@/components/TimeSlotForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/lib/toast";
import {
  useListing,
  useListingBookings,
  useListingCoverImage,
  useListingTimeSlots,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
  timeSlotKeys,
} from "@/hooks";
import type { TimeSlotStatus } from "@/types";
import { getLocalizedTitle } from "@/types/listing";
import { getImageUrl } from "@/utils/image";
import placeholderImage from "@/assets/property-1.jpg";

const ListingBookings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, language, locale } = useLanguage();

  const listingId = id ? parseInt(id, 10) : 0;
  const { data: listing, isLoading } = useListing(listingId);
  const { data: coverImage } = useListingCoverImage(listingId);
  const { data: bookings = [] } = useListingBookings(listingId);
  const { data: timeSlots = [] } = useListingTimeSlots(listingId);

  const updateMutation = useUpdateTimeSlot();
  const deleteSlotMutation = useDeleteTimeSlot();

  const [activeTab, setActiveTab] = useState<"bookings" | "slots">("bookings");
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<number | null>(null);
  const [deleteSlotTarget, setDeleteSlotTarget] = useState<number | null>(null);

  const refreshSlots = () => {
    queryClient.invalidateQueries({
      queryKey: timeSlotKeys.byListing(listingId),
    });
    queryClient.invalidateQueries({
      queryKey: timeSlotKeys.bookings(listingId),
    });
  };

  const handleUpdateStatus = async (
    slotId: number,
    status: Extract<TimeSlotStatus, "CONFIRMED" | "DECLINED">
  ) => {
    try {
      await updateMutation.mutateAsync({ id: slotId, data: { status } });
      toast({
        title: status === "CONFIRMED" ? t("listingBookings.bookingConfirmed") : t("listingBookings.bookingDeclined"),
      });
    } catch (err) {
      toast({
        title: t("listingBookings.updateFailed"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteBooking = async () => {
    if (cancelBookingTarget === null) return;
    const slotId = cancelBookingTarget;
    try {
      await deleteSlotMutation.mutateAsync(slotId);
      toast({ title: t("listingBookings.bookingCancelled") });
    } catch (err) {
      toast({ title: t("listingBookings.cancelFailed"), variant: "destructive" });
    } finally {
      setCancelBookingTarget(null);
    }
  };

  const handleDeleteSlot = async () => {
    if (deleteSlotTarget === null) return;
    const slotId = deleteSlotTarget;
    try {
      await deleteSlotMutation.mutateAsync(slotId);
      toast({ title: t("listingBookings.slotDeleted") });
    } catch (err) {
      toast({ title: t("listingBookings.deleteSlotFailed"), variant: "destructive" });
    } finally {
      setDeleteSlotTarget(null);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <InlineSpinner />
      </PageLayout>
    );
  }

  if (!listing) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("listingBookings.listingNotFound")}</h1>
          <Button onClick={() => navigate("/my-listings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("listingBookings.backToMyListings")}
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <BackButton to={`/listings/${id}`} label={t("listingBookings.backToListing")} />

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{t("listingBookings.manageBookings")}</h1>
            <Calendar className="h-8 w-8 text-primary" />
          </div>

          {listing && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={coverImage ? getImageUrl(coverImage) : placeholderImage}
                    alt={getLocalizedTitle(listing, language)}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h2 className="font-semibold">{getLocalizedTitle(listing, language)}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.city}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "bookings"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("listingBookings.bookingsTab")} ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("slots")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "slots"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("listingBookings.timeSlotsTab")} ({timeSlots.length})
            </button>
          </div>

          {activeTab === "bookings" ? (
            bookings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-xl font-semibold mb-2">{t("listingBookings.noBookings")}</h2>
                  <p className="text-muted-foreground">
                    {t("listingBookings.noBookingsDesc")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-6">
                          <img
                            src={coverImage ? getImageUrl(coverImage) : placeholderImage}
                            alt={getLocalizedTitle(listing, language)}
                            className="w-32 h-32 object-cover rounded-lg"
                          />

                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <h3 className="font-semibold">{listing ? getLocalizedTitle(listing, language) : ""}</h3>
                              <TimeSlotStatusBadge status={booking.status} />
                              <Badge variant="outline">
                                {booking.type === "REMOTE"
                                  ? t("availabilitySlots.typeRemote")
                                  : t("availabilitySlots.typeOnSite")}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{t("listingBookings.candidateId")}: {booking.candidateId}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {formatDateTime(booking.startTime, locale, {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                ·{" "}
                                {new Date(booking.startTime).toLocaleTimeString(locale, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {new Date(booking.endTime).toLocaleTimeString(locale, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {booking.meetLink && booking.status === "CONFIRMED" && (
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
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {booking.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(booking.id, "CONFIRMED")}
                                disabled={updateMutation.isPending && updateMutation.variables?.id === booking.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {t("listingBookings.accept")}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUpdateStatus(booking.id, "DECLINED")}
                                disabled={updateMutation.isPending && updateMutation.variables?.id === booking.id}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {t("listingBookings.decline")}
                              </Button>
                            </>
                          )}
                          {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCancelBookingTarget(booking.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("bookings.cancel")}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{t("listingBookings.availabilitySlots")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("listingBookings.availabilitySlotsDesc")}
                      </p>
                    </div>
                    <Button onClick={() => setShowSlotForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("listingBookings.addTimeSlot")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {timeSlots.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-semibold mb-2">{t("listingBookings.noTimeSlots")}</h2>
                    <p className="text-muted-foreground mb-6">
                      {t("listingBookings.noTimeSlotsDesc")}
                    </p>
                    <Button onClick={() => setShowSlotForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("listingBookings.addFirstTimeSlot")}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                timeSlots.map((slot) => (
                  <Card key={slot.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">
                              {new Date(slot.startTime).toLocaleDateString(locale, {
                                weekday: "long",
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
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="gap-1">
                                {slot.type === "REMOTE" && <Video className="h-3 w-3" />}
                                {slot.type === "REMOTE"
                                  ? t("availabilitySlots.typeRemote")
                                  : t("availabilitySlots.typeOnSite")}
                              </Badge>
                              <Badge className={slot.isBooked ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600"}>
                                {slot.isBooked ? t("listingBookings.booked") : t("listingBookings.available")}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteSlotTarget(slot.id)}
                            disabled={slot.isBooked}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("listingBookings.delete")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {id && (
        <TimeSlotForm
          open={showSlotForm}
          onOpenChange={setShowSlotForm}
          listingId={parseInt(id)}
          onSuccess={refreshSlots}
        />
      )}

      <ConfirmDialog
        open={cancelBookingTarget !== null}
        onOpenChange={(open) => !open && setCancelBookingTarget(null)}
        title={t("listingBookings.delete")}
        description={t("listingBookings.cancelConfirm")}
        onConfirm={handleDeleteBooking}
        confirmLabel={t("listingBookings.delete")}
        destructive
        isLoading={deleteSlotMutation.isPending}
      />

      <ConfirmDialog
        open={deleteSlotTarget !== null}
        onOpenChange={(open) => !open && setDeleteSlotTarget(null)}
        title={t("listingBookings.delete")}
        description={t("listingBookings.deleteSlotConfirm")}
        onConfirm={handleDeleteSlot}
        confirmLabel={t("listingBookings.delete")}
        destructive
        isLoading={deleteSlotMutation.isPending}
      />
    </PageLayout>
  );
};

export default ListingBookings;
