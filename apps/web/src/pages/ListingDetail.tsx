<<<<<<< HEAD
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
  Mail,
  Trash2,
  Phone,
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
=======
import { useState, useCallback, useRef } from "react";
import { Upload, X, ImageIcon, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
>>>>>>> 8521c10 (listingdetail updated)
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { listingsApi, type PendingImage } from "@/api/listings";
import { env } from "@/config/env";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  sessionId: string | null;
  onSessionIdChange: (sessionId: string) => void;
  images: PendingImage[];
  onImagesChange: (images: PendingImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUpload({
  sessionId,
  onSessionIdChange,
  images,
  onImagesChange,
  maxImages = 10,
  disabled = false,
}: ImageUploadProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSessionIdRef = useRef<string | null>(sessionId);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

<<<<<<< HEAD
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
=======
  currentSessionIdRef.current = sessionId;
>>>>>>> 8521c10 (listingdetail updated)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t("imageUpload.invalidType");
    }
    if (file.size > MAX_FILE_SIZE) {
      return t("imageUpload.fileTooLarge");
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<PendingImage | null> => {
    const error = validateFile(file);
    if (error) {
      toast({
        title: t("imageUpload.uploadError"),
        description: `${file.name}: ${error}`,
        variant: "destructive",
      });
      return null;
    }

    try {
      const currentSessionId = currentSessionIdRef.current || "new";
      const response = await listingsApi.uploadPendingImage(
        currentSessionId,
        file
      );

      if (!currentSessionIdRef.current) {
        onSessionIdChange(response.uploadSessionId);
        currentSessionIdRef.current = response.uploadSessionId;
      }

      return response.image;
    } catch (err: any) {
      toast({
        title: t("imageUpload.uploadError"),
        description: err.response?.data?.message || t("imageUpload.uploadFailed"),
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      toast({
        title: t("imageUpload.tooManyImages"),
        description: t("imageUpload.maxImagesReached").replace(
          "{max}",
          String(maxImages)
        ),
        variant: "destructive",
      });
      return;
    }

    setUploadingCount(fileArray.length);

    const successfulUploads: PendingImage[] = [];
    
    for (const file of fileArray) {
      const result = await uploadFile(file);
      if (result) {
        successfulUploads.push(result);
      }
    }

    if (successfulUploads.length > 0) {
      onImagesChange([...images, ...successfulUploads]);
    }

    setUploadingCount(0);
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        await handleFiles(files);
      }
    },
    [disabled, handleFiles]
  );

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFiles(files);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async (imageId: number) => {
    if (!sessionId) return;

    try {
      await listingsApi.deletePendingImage(sessionId, imageId);
      onImagesChange(images.filter((img) => img.id !== imageId));
      toast({
        title: t("imageUpload.imageRemoved"),
        description: t("imageUpload.imageRemovedDesc"),
      });
    } catch (err: any) {
      toast({
        title: t("imageUpload.removeError"),
        description:
          err.response?.data?.message || t("imageUpload.removeFailed"),
        variant: "destructive",
      });
    }
  };

  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleImageDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    onImagesChange(newImages);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${env.apiUrl}${url}`;
  };

<<<<<<< HEAD
  const handleDeleteListing = async () => {
    if (!listing) return;
    setDeleting(true);
    try {
      await listingsApi.delete(listing.id);
      toast({ title: t("myListings.deleteSuccess") });
      navigate("/my-listings");
    } catch (err) {
      toast({
        title: t("myListings.deleteFailed"),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
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
            uploadSessionId: null,
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
          onSuccess={handleBookingSuccess}
=======
  const isUploading = uploadingCount > 0;
  const canUploadMore = images.length < maxImages && !disabled;

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
          !isDragging && !disabled && "border-border hover:border-primary",
          disabled && "border-muted bg-muted/50 cursor-not-allowed",
          canUploadMore && !disabled && "cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => canUploadMore && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || !canUploadMore}
>>>>>>> 8521c10 (listingdetail updated)
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-sm text-foreground">
              {t("imageUpload.uploading")} ({uploadingCount}{" "}
              {t("imageUpload.files")})
            </p>
          </div>
        ) : (
          <>
            <Upload
              className={cn(
                "h-12 w-12 mx-auto mb-4",
                canUploadMore ? "text-muted-foreground" : "text-muted"
              )}
            />
            <p
              className={cn(
                "text-sm mb-1",
                canUploadMore ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {canUploadMore
                ? t("imageUpload.dragOrClick")
                : t("imageUpload.maxReached")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("imageUpload.supportedFormats")} (max 5MB)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {images.length}/{maxImages} {t("imageUpload.imagesUploaded")}
            </p>
          </>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable={!disabled}
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDragLeave={handleImageDragLeave}
              onDrop={(e) => handleImageDrop(e, index)}
              onDragEnd={handleImageDragEnd}
              className={cn(
                "relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted transition-all",
                draggedIndex === index && "opacity-50 scale-95",
                dragOverIndex === index && "ring-2 ring-primary ring-offset-2",
                !disabled && "cursor-grab active:cursor-grabbing"
              )}
            >
              {!disabled && (
                <div className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-5 w-5 text-white drop-shadow-md" />
                </div>
              )}
              <img
                src={getImageUrl(image.url)}
                alt={`Property image ${index + 1}`}
                className="w-full h-full object-cover pointer-events-none"
              />
              {index === 0 && (
                <span className="absolute top-2 right-8 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                  {t("imageUpload.primary")}
                </span>
              )}
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(image.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>{t("imageUpload.noImages")}</span>
        </div>
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
}
