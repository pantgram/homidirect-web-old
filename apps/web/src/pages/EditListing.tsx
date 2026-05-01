import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Upload, X, ImageIcon, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AvailabilitySlotsManager from "@/components/AvailabilitySlotsManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useListing,
  useUpdateListing,
  useListingImages,
  useUploadListingImage,
  useDeleteListingImage,
} from "@/hooks/useListings";
import { LocationSearch, CountrySearch } from "@/components/ui/location-search";
import { getCountryCode } from "@/api/geoapify";
import { env } from "@/config/env";
import { cn } from "@/lib/utils";
import type { PropertyType, UpdateListingRequest, ListingImage } from "@/api";
import type { LocationResult } from "@/api/geoapify";

interface ListingFormData {
  title: string;
  description: string;
  propertyType: PropertyType | "";
  price: string;
  city: string;
  postalCode: string;
  country: string;
  countryCode: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  available: boolean;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 10;

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const listingId = id ? parseInt(id, 10) : 0;

  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data: listing, isLoading: isListingLoading } = useListing(listingId);
  const { data: images = [], isLoading: isImagesLoading } =
    useListingImages(listingId);
  const updateListing = useUpdateListing();
  const uploadImage = useUploadListingImage();
  const deleteImage = useDeleteListingImage();

  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    propertyType: "",
    price: "",
    city: "",
    postalCode: "",
    country: "Ελλάδα",
    countryCode: "gr",
    bedrooms: "",
    bathrooms: "",
    area: "",
    available: true,
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ListingFormData, string>>
  >({});
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAccess =
    user?.role === "LANDLORD" ||
    user?.role === "BOTH" ||
    user?.role === "ADMIN";
  const isOwner = listing && user && listing.landlordId === user.id;
  const isAdmin = user?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;

  // Populate form with existing listing data
  useEffect(() => {
    if (listing) {
      const countryCode = getCountryCode(listing.country || "Greece") || "gr";
      setFormData({
        title: listing.title || "",
        description: listing.description || "",
        propertyType: listing.propertyType || "",
        price: listing.price?.toString() || "",
        city: listing.city || "",
        postalCode: listing.postalCode || "",
        country: listing.country || "Ελλάδα",
        countryCode,
        bedrooms: listing.bedrooms?.toString() || "",
        bathrooms: listing.bathrooms?.toString() || "",
        area: listing.area?.toString() || "",
        available: listing.available ?? true,
      });
    }
  }, [listing]);

  // Redirect if not authorized
  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || !canAccess)) {
      toast({
        title: t("listForm.accessDenied"),
        description: t("listForm.accessDeniedDesc"),
        variant: "destructive",
      });
      navigate("/my-listings");
    }
  }, [isAuthenticated, canAccess, isAuthLoading, navigate, toast, t]);

  // Redirect if not owner
  useEffect(() => {
    if (!isListingLoading && listing && !canEdit) {
      toast({
        title: t("editListing.notOwner"),
        description: t("editListing.notOwnerDesc"),
        variant: "destructive",
      });
      navigate("/my-listings");
    }
  }, [isListingLoading, listing, canEdit, navigate, toast, t]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (formErrors[id as keyof ListingFormData]) {
      setFormErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof ListingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ListingFormData, string>> = {};

    if (!formData.title.trim()) {
      errors.title = t("listForm.validation.titleRequired");
    }
    if (!formData.propertyType) {
      errors.propertyType = t("listForm.validation.typeRequired");
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = t("listForm.validation.priceRequired");
    }
    if (!formData.city.trim()) {
      errors.city = t("listForm.validation.cityRequired");
    }
    if (!formData.bedrooms) {
      errors.bedrooms = t("listForm.validation.bedroomsRequired");
    }
    if (!formData.bathrooms) {
      errors.bathrooms = t("listForm.validation.bathroomsRequired");
    }
    if (!formData.area || parseFloat(formData.area) <= 0) {
      errors.area = t("listForm.validation.areaRequired");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: t("listForm.validation.error"),
        description: t("listForm.validation.fixErrors"),
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: t("listForm.validation.imagesRequired"),
        description: t("listForm.validation.addImages"),
        variant: "destructive",
      });
      return;
    }

    const updateData: UpdateListingRequest = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      propertyType: formData.propertyType as PropertyType,
      price: parseFloat(formData.price),
      city: formData.city.trim(),
      postalCode: formData.postalCode.trim() || undefined,
      country: formData.country.trim() || "Greece",
      bedrooms: parseInt(formData.bedrooms, 10),
      bathrooms: parseInt(formData.bathrooms, 10),
      area: parseFloat(formData.area),
      available: formData.available,
    };

    try {
      await updateListing.mutateAsync({ id: listingId, data: updateData });
      toast({
        title: t("editListing.updated"),
        description: t("editListing.updatedDesc"),
      });
      navigate("/my-listings");
    } catch (err: any) {
      toast({
        title: t("editListing.error"),
        description: err.response?.data?.message || t("editListing.errorDesc"),
        variant: "destructive",
      });
    }
  };

  // Image handling
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t("imageUpload.invalidType");
    }
    if (file.size > MAX_FILE_SIZE) {
      return t("imageUpload.fileTooLarge");
    }
    return null;
  };

  const uploadFileToListing = async (file: File): Promise<boolean> => {
    const error = validateFile(file);
    if (error) {
      toast({
        title: t("imageUpload.uploadError"),
        description: `${file.name}: ${error}`,
        variant: "destructive",
      });
      return false;
    }

    try {
      await uploadImage.mutateAsync({ listingId, file });
      return true;
    } catch (err: any) {
      toast({
        title: t("imageUpload.uploadError"),
        description:
          err.response?.data?.message || t("imageUpload.uploadFailed"),
        variant: "destructive",
      });
      return false;
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - images.length;

    if (fileArray.length > remainingSlots) {
      toast({
        title: t("imageUpload.tooManyImages"),
        description: t("imageUpload.maxImagesReached").replace(
          "{max}",
          String(MAX_IMAGES)
        ),
        variant: "destructive",
      });
      return;
    }

    setUploadingCount(fileArray.length);

    for (const file of fileArray) {
      await uploadFileToListing(file);
    }

    setUploadingCount(0);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        await handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async (imageId: number) => {
    try {
      await deleteImage.mutateAsync({ listingId, imageId });
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

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${env.apiUrl}${url}`;
  };

  const isUploading = uploadingCount > 0;
  const canUploadMore = images.length < MAX_IMAGES;
  const isLoading = isAuthLoading || isListingLoading || isImagesLoading;
  const isSaving = updateListing.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !canAccess || !listing || !canEdit) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/my-listings")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("editListing.backToListings")}
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("editListing.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("editListing.subtitle")}
          </p>
        </div>

        {/* Form */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>{t("listForm.propertyDetails")}</CardTitle>
            <CardDescription>
              {t("listForm.propertyDetailsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">{t("listForm.propertyTitle")}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder={t("listForm.titlePlaceholder")}
                    className={formErrors.title ? "border-destructive" : ""}
                  />
                  {formErrors.title && (
                    <p className="text-sm text-destructive mt-1">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyType">
                      {t("listForm.propertyType")}
                    </Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) =>
                        handleSelectChange("propertyType", value)
                      }
                    >
                      <SelectTrigger
                        id="propertyType"
                        className={
                          formErrors.propertyType ? "border-destructive" : ""
                        }
                      >
                        <SelectValue placeholder={t("common.selectType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">
                          {t("listForm.types.apartment")}
                        </SelectItem>
                        <SelectItem value="house">
                          {t("listForm.types.house")}
                        </SelectItem>
                        <SelectItem value="studio">
                          {t("listForm.types.studio")}
                        </SelectItem>
                        <SelectItem value="room">
                          {t("listForm.types.room")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.propertyType && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.propertyType}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="price">{t("listForm.monthlyRent")}</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="1200"
                      className={formErrors.price ? "border-destructive" : ""}
                    />
                    {formErrors.price && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.price}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">{t("listForm.country")}</Label>
                    <CountrySearch
                      value={formData.country}
                      onValueChange={(value, code) => {
                        setFormData((prev) => ({
                          ...prev,
                          country: value,
                          countryCode: code || "",
                          city: "", // Reset city when country changes
                        }));
                        if (formErrors.country) {
                          setFormErrors((prev) => ({ ...prev, country: undefined }));
                        }
                      }}
                      placeholder={t("locationSearch.selectCountry")}
                      searchPlaceholder={t("locationSearch.searchCountries")}
                      emptyMessage={t("locationSearch.noCountriesFound")}
                      error={!!formErrors.country}
                      lang={language === "el" ? "el" : "en"}
                    />
                    {formErrors.country && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.country}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city">{t("listForm.city")}</Label>
                    <LocationSearch
                      value={formData.city}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, city: value }));
                        if (formErrors.city) {
                          setFormErrors((prev) => ({ ...prev, city: undefined }));
                        }
                      }}
                      onLocationSelect={(location: LocationResult) => {
                        if (location.postalCode) {
                          setFormData((prev) => ({
                            ...prev,
                            postalCode: location.postalCode || prev.postalCode,
                          }));
                        }
                      }}
                      placeholder={t("locationSearch.selectCity")}
                      searchPlaceholder={t("locationSearch.searchCities")}
                      emptyMessage={t("locationSearch.noCitiesFound")}
                      error={!!formErrors.city}
                      countryCode={formData.countryCode}
                      lang={language === "el" ? "el" : "en"}
                    />
                    {formErrors.city && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.city}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="postalCode">
                    {t("listForm.postalCode")}
                  </Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="10680"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">{t("listForm.bedrooms")}</Label>
                    <Select
                      value={formData.bedrooms}
                      onValueChange={(value) =>
                        handleSelectChange("bedrooms", value)
                      }
                    >
                      <SelectTrigger
                        id="bedrooms"
                        className={
                          formErrors.bedrooms ? "border-destructive" : ""
                        }
                      >
                        <SelectValue placeholder={t("common.select")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.bedrooms && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.bedrooms}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bathrooms">{t("listForm.bathrooms")}</Label>
                    <Select
                      value={formData.bathrooms}
                      onValueChange={(value) =>
                        handleSelectChange("bathrooms", value)
                      }
                    >
                      <SelectTrigger
                        id="bathrooms"
                        className={
                          formErrors.bathrooms ? "border-destructive" : ""
                        }
                      >
                        <SelectValue placeholder={t("common.select")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.bathrooms && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.bathrooms}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="area">{t("listForm.area")}</Label>
                    <Input
                      id="area"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="85"
                      className={formErrors.area ? "border-destructive" : ""}
                    />
                    {formErrors.area && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.area}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">
                    {t("listForm.description")}
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={t("listForm.descriptionPlaceholder")}
                    className="min-h-[120px]"
                  />
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center gap-3">
                  <Label htmlFor="available">
                    {t("editListing.availability")}
                  </Label>
                  <Select
                    value={formData.available ? "available" : "unavailable"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        available: value === "available",
                      }))
                    }
                  >
                    <SelectTrigger id="available" className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">
                        {t("editListing.available")}
                      </SelectItem>
                      <SelectItem value="unavailable">
                        {t("editListing.unavailable")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <div>
                  <Label>{t("listForm.propertyImages")}</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("listForm.imagesHint")}
                  </p>
                </div>

                {/* Upload Zone */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragging && "border-primary bg-primary/5",
                    !isDragging && "border-border hover:border-primary",
                    canUploadMore && "cursor-pointer"
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
                    disabled={!canUploadMore}
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
                          canUploadMore
                            ? "text-foreground"
                            : "text-muted-foreground"
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
                        {images.length}/{MAX_IMAGES}{" "}
                        {t("imageUpload.imagesUploaded")}
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
                        className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                      >
                        <img
                          src={getImageUrl(image.url)}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                            {t("imageUpload.primary")}
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(image.id);
                          }}
                          disabled={deleteImage.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
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
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/my-listings")}
                  disabled={isSaving}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("editListing.saving")}
                    </>
                  ) : (
                    t("editListing.saveChanges")
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Availability Slots */}
        {listing && user && (
          <div className="max-w-3xl mx-auto mt-8">
            <AvailabilitySlotsManager
              listingId={listingId}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EditListing;
