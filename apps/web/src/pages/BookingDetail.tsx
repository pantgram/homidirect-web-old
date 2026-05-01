import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Home,
  User,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { bookingsApi } from "@/api/bookings";
import { listingsApi } from "@/api/listings";
import type { Booking, Listing, ListingImage } from "@/api/types";
import placeholderImage from "@/assets/property-1.jpg";

interface ListingWithImages extends Listing {
  images?: ListingImage[];
}
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

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError(t("bookingDetail.errorLoading" as any));
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
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              t("bookingDetail.bookingConfirmed" as any)
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              t("bookingDetail.bookingDeclined" as any),
      });
    } catch (err) {
      toast({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: t("bookingDetail.updateFailed" as any),
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: t("bookingDetail.bookingCancelled" as any),
      });
      navigate("/bookings");
    } catch (err) {
      toast({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: t("bookingDetail.cancelFailed" as any),
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; icon: React.ReactNode; className: string }
    > = {
      PENDING: {
        label: "Pending",
        icon: <Clock className="h-3 w-3" />,
        className: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
      },
      CONFIRMED: {
        label: "Confirmed",
        icon: <CheckCircle className="h-3 w-3" />,
        className: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
      },
      DECLINED: {
        label: "Declined",
        icon: <XCircle className="h-3 w-3" />,
        className: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
      },
      CANCELLED: {
        label: "Cancelled",
        icon: <AlertCircle className="h-3 w-3" />,
        className: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20",
      },
    };

    const config =
      statusConfig[status] ||
      statusConfig.CANCELLED ||
      ({
        label: status,
        icon: <AlertCircle className="h-3 w-3" />,
        className: "bg-gray-500/10 text-gray-600",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

    return (
      <Badge className={config.className}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || "Booking not found"}
          </h1>
          <Button onClick={() => navigate("/bookings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isLandlord = user?.id === booking.landlordId;
  const canCancel = booking.status === "PENDING";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
              {getStatusBadge(booking.status)}
            </div>
            {canCancel && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {t("bookingDetail.cancelBooking" as any)}
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <img
                  src={listing?.images?.[0]?.url || placeholderImage}
                  alt={listing?.title}
                  className="w-48 h-36 object-cover rounded-lg"
                />

                <div className="flex-1 space-y-3">
                  <div>
                    <Link
                      to={`/listings/${listing?.id}`}
                      className="text-xl font-semibold hover:text-primary transition-colors"
                    >
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {listing?.title || t("bookingDetail.unknownListing" as any)}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{listing?.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        <span>€{listing?.price}/month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Viewing Schedule</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="text-lg font-medium">
                      {formatDate(booking.scheduledAt)}
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
                        Join Video Call
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
                <h2 className="text-xl font-semibold mb-4">Actions</h2>
                <p className="text-muted-foreground mb-6">
                  Review this viewing request and take action.
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleUpdateStatus("CONFIRMED")}
                    disabled={updating}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm Booking
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus("DECLINED")}
                    disabled={updating}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Decline Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t("bookingDetail.cancelBooking" as any)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t("bookingDetail.cancelConfirm" as any)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default BookingDetail;
