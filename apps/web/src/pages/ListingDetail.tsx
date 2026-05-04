import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Mail,
  Trash2,
  Loader2,
  CheckCircle,
  Building,
  Clock,
  Pencil,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContactOwnerDialog from "@/components/ContactOwnerDialog";
import BookingDialog from "@/components/BookingDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { listingsApi } from "@/api/listings";
import { favoritesApi } from "@/api/favorites";
import { availabilitySlotsApi } from "@/api/availability-slots";
import { env } from "@/config/env";
import type {
  Listing,
  ListingImage,
  AvailabilitySlot,
  PropertyType,
} from "@/api/types";
import placeholderImage from "@/assets/property-1.jpg";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);

  const listingId = id ? parseInt(id, 10) : 0;

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} m\u00B2`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${env.apiUrl}${url}`;
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

  const fetchListing = useCallback(async () => {
    if (!listingId) return;

    setLoading(true);
    setError(null);

    try {
      const [listingData, imagesData] = await Promise.all([
        listingsApi.getById(listingId),
        listingsApi.getImages(listingId),
      ]);
      setListing(listingData);
      setImages(imagesData);

      if (isAuthenticated) {
        try {
          const isFav = await favoritesApi.checkFavorite(listingId);
          setIsFavorite(isFav);
        } catch {
          // Ignore favorite check errors
        }
      }

      try {
        const slots = await availabilitySlotsApi.getAvailableSlotsByListingId(listingId);
        setAvailableSlots(slots);
      } catch {
        // Ignore availability slot errors
      }
    } catch (err) {
      setError(t("listingDetail.notFoundDesc"));
    } finally {
      setLoading(false);
    }
  }, [listingId, isAuthenticated, t]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleToggleFavorite = async () => {
    if (!listing || !isAuthenticated) {
      navigate("/auth");
      return;
    }

    setFavoriteLoading(true);
    try {
      const newFavoriteState = await favoritesApi.toggleFavorite(
        listing.id,
        isFavorite
      );
      setIsFavorite(newFavoriteState);
      toast({
        title: newFavoriteState
          ? t("favorites.added")
          : t("favorites.removed"),
      });
    } catch {
      toast({
        title: t("favorites.removeFailed"),
        variant: "destructive",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: t("listingDetail.linkCopied"),
      });
    } catch {
      toast({
        title: t("listingDetail.shareFailed"),
        variant: "destructive",
      });
    }
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    setContactDialogOpen(true);
  };

  const handleRequestViewing = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    setBookingDialogOpen(true);
  };

  const handleBookingSuccess = () => {
    setBookingDialogOpen(false);
    toast({
      title: t("listingDetail.bookingSent"),
    });
  };

  const handleDeleteListing = async () => {
    if (!listing) return;
    setDeleting(true);
    try {
      await listingsApi.delete(listing.id);
      toast({ title: t("myListings.deleteSuccess") });
      navigate("/my-listings");
    } catch {
      toast({
        title: t("myListings.deleteFailed"),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const displayImages =
    images.length > 0
      ? images
      : [
          {
            id: 0,
            listingId: listing?.id ?? 0,
            url: placeholderImage,
            uploadSessionId: null,
            createdAt: "",
          },
        ];
  const currentImage = displayImages[currentImageIndex];

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
          {t("listingDetail.back")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-xl overflow-hidden bg-muted">
              <div className="aspect-[16/10] relative">
                <img
                  src={getImageUrl(currentImage.url)}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />

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

                {displayImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                )}

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
                        src={getImageUrl(img.url)}
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              {!user || user.id !== listing.landlordId ? (
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

                    <Link to={`/listings/${listing.id}/edit`}>
                      <Button className="w-full" size="lg">
                        <Pencil className="h-4 w-4 mr-2" />
                        {t("listingDetail.editListing")}
                      </Button>
                    </Link>
                    <Separator className="mb-6" />
                    <Button
                      className="w-full"
                      variant="destructive"
                      size="lg"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("listingDetail.deleteListing")}
                    </Button>
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

      <ContactOwnerDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        listingTitle={listing.title}
        listingId={listing.id}
      />

      {user && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          listingId={listing.id}
          listingTitle={listing.title}
          onSuccess={handleBookingSuccess}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("myListings.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("myListings.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("listingDetail.no")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteListing}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("myListings.delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListingDetail;
