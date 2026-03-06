import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Calendar,
  Home,
  Users,
  Mail,
  Phone,
  Loader2,
  CheckCircle,
  Building,
  Clock,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContactOwnerDialog from "@/components/ContactOwnerDialog";
import BookingDialog from "@/components/BookingDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { listingsApi } from "@/api/listings";
import { favoritesApi } from "@/api/favorites";
import { availabilitySlotsApi } from "@/api/availability-slots";
import type {
  Listing,
  ListingImage,
  PropertyType,
  AvailabilitySlot,
} from "@/api/types";
import placeholderImage from "@/assets/property-1.jpg";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const listingData = await listingsApi.getById(parseInt(id));
        setListing(listingData);

        // Fetch images separately - don't fail if images endpoint fails
        try {
          const imagesData = await listingsApi.getImages(parseInt(id));
          setImages(imagesData);
        } catch (imgErr) {
          console.error("Failed to fetch images:", imgErr);
          // Continue without images
        }

        // Check if listing is favorited (only for authenticated users)
        if (isAuthenticated) {
          try {
            const favorited = await favoritesApi.checkFavorite(parseInt(id));
            setIsFavorite(favorited);
          } catch (favErr) {
            console.error("Failed to check favorite status:", favErr);
          }
        }

        // Fetch available slots for this listing
        try {
          const slots = await availabilitySlotsApi.getAvailableSlotsByListingId(
            parseInt(id),
          );
          setAvailableSlots(slots.slice(0, 5));
        } catch (slotsErr) {
          console.error("Failed to fetch availability slots:", slotsErr);
        }
      } catch (err) {
        console.error("Failed to fetch listing:", err);
        setError(t("listingDetail.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, t, isAuthenticated]);

  useEffect(() => {
    const state = location.state as {
      returnTo?: string;
      action?: "contact" | "booking";
    } | null;

    if (isAuthenticated && state?.action && listing) {
      if (state.action === "contact") {
        setContactDialogOpen(true);
      } else if (state.action === "booking") {
        setBookingDialogOpen(true);
      }

      window.history.replaceState({}, document.title);
    }
  }, [isAuthenticated, location.state, listing]);

  const handleToggleFavorite = async () => {
    if (!id) return;

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    setFavoriteLoading(true);
    try {
      const newFavoriteState = await favoritesApi.toggleFavorite(
        parseInt(id),
        isFavorite,
      );
      setIsFavorite(newFavoriteState);
      toast({
        title: newFavoriteState ? t("favorites.added") : t("favorites.removed"),
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      toast({
        title: t("favorites.removeFailed"),
        variant: "destructive",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} m²`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPropertyTypeLabel = (type: PropertyType) => {
    const labels: Record<PropertyType, string> = {
      apartment: t("search.apartment"),
      house: t("search.house"),
      studio: t("search.studio"),
      room: t("search.room"),
    };
    return labels[type] || type;
  };

  const handlePrevImage = () => {
    const totalImages = images.length > 0 ? images.length : 1;
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const totalImages = images.length > 0 ? images.length : 1;
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: `${t("listingDetail.shareText")}: ${listing?.title}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
        if ((err as Error).name !== "AbortError") {
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      await copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t("listingDetail.linkCopied"),
        description: t("listingDetail.linkCopiedDesc"),
      });
    } catch (err) {
      toast({
        title: t("listingDetail.shareFailed"),
        variant: "destructive",
      });
    }
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      navigate("/auth", {
        state: {
          returnTo: `/listings/${id}`,
          action: "contact",
        },
      });
      return;
    }

    setContactDialogOpen(true);
  };

  const handleRequestViewing = () => {
    if (!isAuthenticated) {
      navigate("/auth", {
        state: {
          returnTo: `/listings/${id}`,
          action: "booking",
        },
      });
      return;
    }
    setBookingDialogOpen(true);
  };

  const handleBookingSuccess = () => {
    toast({
      title: t("listingDetail.bookingSent"),
    });
  };

  const formatSlotDate = (startTime: string) => {
    const date = new Date(startTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `${t("listingDetail.today")} ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `${t("listingDetail.tomorrow")} ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
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

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t("listingDetail.notFound")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {error || t("listingDetail.notFoundDesc")}
          </p>
          <Button onClick={() => navigate("/search")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("listingDetail.backToSearch")}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const displayImages =
    images.length > 0
      ? images
      : [
          {
            id: 0,
            listingId: listing.id,
            url: placeholderImage,
            isPrimary: true,
            order: 0,
            createdAt: "",
          },
        ];
  const currentImage = displayImages[currentImageIndex];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("listingDetail.back")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-xl overflow-hidden bg-muted">
              <div className="aspect-[16/10] relative">
                <img
                  src={currentImage.url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />

                {/* Image Navigation */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {displayImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                    className="bg-background/80 hover:bg-background rounded-full p-2 transition-colors disabled:opacity-50"
                  >
                    {favoriteLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Heart
                        className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                      />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {displayImages.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {displayImages.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${listing.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Location */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {getPropertyTypeLabel(listing.propertyType)}
                </Badge>
                {listing.available ? (
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t("listingDetail.available")}
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    {t("listingDetail.unavailable")}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-2">
                {listing.title}
              </h1>

              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2" />
                <span>
                  {listing.city}
                  {listing.postalCode && `, ${listing.postalCode}`}
                  {listing.country && `, ${listing.country}`}
                </span>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bed className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("listingDetail.bedrooms")}
                    </p>
                    <p className="font-semibold">{listing.bedrooms}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bath className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("listingDetail.bathrooms")}
                    </p>
                    <p className="font-semibold">{listing.bathrooms}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Square className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("listingDetail.area")}
                    </p>
                    <p className="font-semibold">{formatArea(listing.area)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("listingDetail.type")}
                    </p>
                    <p className="font-semibold">
                      {getPropertyTypeLabel(listing.propertyType)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {t("listingDetail.description")}
                </h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {t("listingDetail.details")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("listingDetail.propertyType")}
                      </p>
                      <p className="font-medium">
                        {getPropertyTypeLabel(listing.propertyType)}
                      </p>
                    </div>
                  </div>

                  {listing.maxTenants && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("listingDetail.maxTenants")}
                        </p>
                        <p className="font-medium">{listing.maxTenants}</p>
                      </div>
                    </div>
                  )}

                  {listing.shareable !== undefined && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("listingDetail.shareable")}
                        </p>
                        <p className="font-medium">
                          {listing.shareable
                            ? t("listingDetail.yes")
                            : t("listingDetail.no")}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("listingDetail.listedOn")}
                      </p>
                      <p className="font-medium">
                        {formatDate(listing.createdAt)}
                      </p>
                    </div>
                  </div>

                  {listing.pricePerRoom && (
                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("listingDetail.pricePerRoom")}
                        </p>
                        <p className="font-medium">
                          €{formatPrice(listing.pricePerRoom)}/
                          {t("listingDetail.month")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              {!user ||
              (user.id !== listing.landlordId &&
                (user.role == "BOTH" ||
                  user.role == "ADMIN" ||
                  user.role == "TENANT")) ? (
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("listingDetail.monthlyRent")}
                      </p>
                      <div className="text-4xl font-bold text-primary">
                        €{formatPrice(listing.price)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("propertyCard.perMonth")}
                      </p>
                    </div>

                    <Separator className="mb-6" />

                    <div className="space-y-4">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleContactOwner}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {t("listingDetail.contactOwner")}
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={handleRequestViewing}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {t("listingDetail.requestViewing")}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      {t("listingDetail.directContact")}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("listingDetail.monthlyRent")}
                      </p>
                      <div className="text-4xl font-bold text-primary">
                        €{formatPrice(listing.price)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("propertyCard.perMonth")}
                      </p>
                    </div>

                    <Separator className="mb-6" />

                    <Link to={`/listing/${listing.id}/bookings`}>
                      <Button className="w-full" size="lg">
                        <Calendar className="h-4 w-4 mr-2" />
                        {t("listingDetail.manageBookings")}
                      </Button>
                    </Link>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      {t("listingDetail.manageBookingsDesc")}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">
                    {t("listingDetail.quickStats")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("listingDetail.bedrooms")}
                      </span>
                      <span className="font-medium">{listing.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("listingDetail.bathrooms")}
                      </span>
                      <span className="font-medium">{listing.bathrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("listingDetail.area")}
                      </span>
                      <span className="font-medium">
                        {formatArea(listing.area)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("listingDetail.pricePerSqm")}
                      </span>
                      <span className="font-medium">
                        €{(listing.price / listing.area).toFixed(2)}/m²
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Slots */}
              {availableSlots.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t("listingDetail.availableViewingTimes")}
                    </h3>
                    <div className="space-y-2">
                      {availableSlots.slice(0, 3).map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-sm">
                              {formatSlotDate(slot.startTime)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleRequestViewing}
                          >
                            {t("listingDetail.book")}
                          </Button>
                        </div>
                      ))}
                      {availableSlots.length > 3 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={handleRequestViewing}
                        >
                          {t("listingDetail.viewAllSlots").replace(
                            "{count}",
                            availableSlots.length.toString(),
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Safety Notice */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t("listingDetail.safetyTip")}:</strong>{" "}
                    {t("listingDetail.safetyTipDesc")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Contact Owner Dialog */}
      <ContactOwnerDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        listingTitle={listing.title}
        listingId={listing.id}
      />

      {/* Booking Dialog */}
      {user && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          listingId={listing.id}
          listingTitle={listing.title}
          landlordId={listing.landlordId}
          candidateId={user.id}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default ListingDetail;
