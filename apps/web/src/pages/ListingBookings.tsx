import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Home,
  User,
  Video,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Edit,
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
import { availabilitySlotsApi } from "@/api/availability-slots";
import type { Booking, AvailabilitySlot } from "@/api/types";
import placeholderImage from "@/assets/property-1.jpg";

const ListingBookings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [listing, setListing] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bookings" | "slots">("bookings");
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const listingData = await listingsApi.getById(parseInt(id));
        setListing(listingData);

        const bookingsData = await bookingsApi.getByListingId(parseInt(id));
        setBookings(bookingsData);

        const slotsData = await availabilitySlotsApi.getByListingId(parseInt(id));
        setAvailabilitySlots(slotsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load booking data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdateStatus = async (bookingId: number, status: "CONFIRMED" | "DECLINED") => {
    setUpdating(bookingId);
    try {
      const updated = await bookingsApi.update(bookingId, { status });
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      toast({
        title: status === "CONFIRMED" ? "Booking confirmed" : "Booking declined",
      });
    } catch (err) {
      console.error("Failed to update booking:", err);
      toast({
        title: "Failed to update booking",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

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

  const handleDeleteSlot = async (slotId: number) => {
    if (!confirm("Are you sure you want to delete this time slot?")) {
      return;
    }

    try {
      await availabilitySlotsApi.delete(slotId);
      setAvailabilitySlots((prev) => prev.filter((s) => s.id !== slotId));
      toast({
        title: "Time slot deleted",
      });
    } catch (err) {
      console.error("Failed to delete slot:", err);
      toast({
        title: "Failed to delete time slot",
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
        icon: <XCircle className="h-3 w-3" />,
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

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
          <Button onClick={() => navigate("/my-listings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Listings
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/listings/${id}`)}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listing
        </Button>

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Manage Bookings</h1>
            <Calendar className="h-8 w-8 text-primary" />
          </div>

          {listing && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={listing.images?.[0]?.url || placeholderImage}
                    alt={listing.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h2 className="font-semibold">{listing.title}</h2>
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
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("slots")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "slots"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Time Slots ({availabilitySlots.length})
            </button>
          </div>

          {activeTab === "bookings" ? (
            bookings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
                  <p className="text-muted-foreground">
                    When candidates book viewings, they will appear here.
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
                            src={listing?.images?.[0]?.url || placeholderImage}
                            alt={listing?.title}
                            className="w-32 h-32 object-cover rounded-lg"
                          />

                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <h3 className="font-semibold">{listing?.title}</h3>
                              {getStatusBadge(booking.status)}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>Candidate ID: {booking.candidateId}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {formatDate(booking.scheduledAt)}
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
                                  Join Video Call
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
                                disabled={updating === booking.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUpdateStatus(booking.id, "DECLINED")}
                                disabled={updating === booking.id}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Decline
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
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
                      <h3 className="font-semibold mb-1">Availability Time Slots</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage when candidates can book viewings for your property.
                      </p>
                    </div>
                    <Button onClick={() => navigate(`/listings/${id}/availability/add`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {availabilitySlots.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-semibold mb-2">No time slots available</h2>
                    <p className="text-muted-foreground mb-6">
                      Add availability slots to let candidates book viewings.
                    </p>
                    <Button onClick={() => navigate(`/listings/${id}/availability/add`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Time Slot
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                availabilitySlots.map((slot) => (
                  <Card key={slot.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">
                              {new Date(slot.startTime).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(slot.startTime).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {new Date(slot.endTime).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={slot.isBooked ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600"}>
                                {slot.isBooked ? "Booked" : "Available"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/listings/${id}/availability/edit/${slot.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSlot(slot.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
      </main>

      <Footer />
    </div>
  );
};

export default ListingBookings;
