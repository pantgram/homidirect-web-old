import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Loader2, Calendar, Clock, MapPin, Home, ArrowLeft, Trash2, Video, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { bookingsApi } from "@/api/bookings";
import { listingsApi } from "@/api/listings";
import type { Booking } from "@/api/types";
import placeholderImage from "@/assets/property-1.jpg";

const Bookings = () => {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<Record<number, any>>({});

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allBookings = await bookingsApi.getAll();
      setBookings(allBookings);

      const listingIds = [...new Set(allBookings.map((b) => b.listingId))];
      const listingsData: Record<number, any> = {};
      
      await Promise.all(
        listingIds.map(async (id) => {
          try {
            const listing = await listingsApi.getById(id);
            listingsData[id] = listing;
          } catch (err) {
            console.error(`Failed to fetch listing ${id}:`, err);
          }
        })
      );

      setListings(listingsData);
    } catch (err) {
      setError("Failed to load bookings");
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        return;
      }
      fetchBookings();
    }
  }, [isAuthLoading, isAuthenticated, fetchBookings]);

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await bookingsApi.delete(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      toast({
        title: "Booking cancelled",
      });
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      toast({
        title: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
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

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config?.className}>
        {config?.icon}
        <span className="ml-1">{config?.label}</span>
      </Badge>
    );
  };

  if (isAuthLoading || loading) {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <Calendar className="h-8 w-8 text-primary" />
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
                <p className="text-muted-foreground mb-6">
                  When you book a viewing, it will appear here.
                </p>
                <Link to="/search">
                  <Button>Browse Listings</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const listing = listings[booking.listingId];
                return (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <img
                          src={listing?.images?.[0]?.url || placeholderImage}
                          alt={listing?.title}
                          className="w-32 h-32 object-cover rounded-lg"
                        />

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link
                                to={`/listings/${booking.listingId}`}
                                className="text-lg font-semibold hover:text-primary transition-colors"
                              >
                                {listing?.title || "Unknown Listing"}
                              </Link>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
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
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {formatDate(booking.scheduledAt)}
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
                                  Join Video Call
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
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Cancel
                            </Button>
                          )}
                          <Link to={`/bookings/${booking.id}`}>
                            <Button variant="ghost" size="sm">
                              View Details
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
      </main>

      <Footer />
    </div>
  );
};

export default Bookings;
