import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { InlineSpinner, BackButton } from "@/components/shared";
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
import { toast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useListing,
  useUpdateListing,
  useListingImages,
  useUploadListingImage,
  useDeleteListingImage,
} from "@/hooks/useListings";
import { LocationSearch } from "@/components/ui/location-search";
import { LocationMap } from "@/components/ui/location-map";
import { reverseGeocode } from "@/api/geocoding";
import { getImageUrl } from "@/utils/image";
import { cn } from "@/lib/utils";
import type { PropertyType, UpdateListingRequest } from "@/api";
import { getApiError } from "@/api";
import type { LocationResult } from "@/api/geocoding";

interface ListingFormData {
  titleEl: string;
  descriptionEl: string;
  propertyType: PropertyType | "";
  price: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: string;
  bathrooms: string;
  area: string;
  available: boolean;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const listingId = id ? parseInt(id, 10) : 0;

  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, isLoading: isAuthLoading } = useAuth();

  const { data: listing, isLoading: isListingLoading } = useListing(listingId);
  const { data: images = [], isLoading: isImagesLoading } =
    useListingImages(listingId);
  const updateListing = useUpdateListing();
  const uploadImage = useUploadListingImage();
  const deleteImage = useDeleteListingImage();

  const [formData, setFormData] = useState<ListingFormData>({
    titleEl: "",
    descriptionEl: "",
    propertyType: "",
    price: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    latitude: null,
    longitude: null,
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

  const isOwner = listing && user && listing.landlordId === user.id;
  const isAdmin = user?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;

  useEffect(() => {
    if (listing) {
      setFormData({
        titleEl: listing.titleEl || "",
        descriptionEl: listing.descriptionEl || "",
        propertyType: listing.propertyType || "",
        price: listing.price?.toString() || "",
        address: listing.address || "",
        city: listing.city || "",
        postalCode: listing.postalCode || "",
        country: listing.country || "",
        latitude: listing.latitude ?? null,
        longitude: listing.longitude ?? null,
        bedrooms: listing.bedrooms?.toString() || "",
        bathrooms: listing.bathrooms?.toString() || "",
        area: listing.area?.toString() || "",
        available: listing.available ?? true,
      });
    }
  }, [listing]);

  useEffect(() => {
    if (!isListingLoading && listing && !canEdit) {
      toast({
        title: t("editListing.notOwner"),
        description: t("editListing.notOwnerDesc"),
        variant: "destructive",
      });
      navigate("/my-listings");
    }
  }, [isListingLoading, listing, canEdit, navigate, t]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

    if (!formData.titleEl.trim()) {
      errors.titleEl = t("listForm.validation.titleRequired");
    }
    if (!formData.propertyType) {
      errors.propertyType = t("listForm.validation.typeRequired");
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = t("listForm.validation.priceRequired");
    }
    if (!formData.address.trim()) {
      errors.address = t("listForm.validation.addressRequired");
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
      titleEl: formData.titleEl.trim(),
      descriptionEl: formData.descriptionEl.trim(),
      propertyType: formData.propertyType as PropertyType,
      price: parseFloat(formData.price),
      address: formData.address.trim(),
      city: formData.city.trim(),
      postalCode: formData.postalCode.trim() || undefined,
      country: formData.country.trim() || "Greece",
      latitude: formData.latitude ?? undefined,
      longitude: formData.longitude ?? undefined,
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
    } catch (err) {
      toast({
        title: t("editListing.error"),
        description: getApiError(err).message || t("editListing.errorDesc"),
        variant: "destructive",
      });
    }
  };

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t("imageUpload.invalidType");
    }
    if (file.size > MAX_FILE_SIZE) {
      return t("imageUpload.fileTooLarge");
    }
    return null;
  }, [t]);

  const uploadFileToListing = useCallback(async (file: File): Promise<boolean> => {
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
    } catch (err) {
      toast({
        title: t("imageUpload.uploadError"),
        description: getApiError(err).message || t("imageUpload.uploadFailed"),
        variant: "destructive",
      });
      return false;
    }
  }, [validateFile, t, uploadImage, listingId]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - images.length;

    if (fileArray.length > remainingSlots) {
      toast({
        title: t("imageUpload.tooManyImages"),
        description: t("imageUpload.maxImagesReached").replace(
          "{max}",
          String(MAX_IMAGES),
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
  }, [images, t, uploadFileToListing]);

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
    [handleFiles],
  );

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
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
    } catch (err) {
      toast({
        title: t("imageUpload.removeError"),
        description: getApiError(err).message || t("imageUpload.removeFailed"),
        variant: "destructive",
      });
    }
  };

  const isUploading = uploadingCount > 0;
  const canUploadMore = images.length < MAX_IMAGES;
  const isSaving = updateListing.isPending;

  if (isAuthLoading) return <PageLayout><InlineSpinner /></PageLayout>;

  if (isListingLoading || isImagesLoading) {
    return <PageLayout><InlineSpinner /></PageLayout>;
  }

  if (!listing || !canEdit) {
    return null;
  }

  return (
    <PageLayout>
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto mb-8">
              <BackButton to="/my-listings" label={t("editListing.backToListings")} />
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {t("editListing.title")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("editListing.subtitle")}
              </p>
            </div>

            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>{t("listForm.propertyDetails")}</CardTitle>
                <CardDescription>
                  {t("listForm.propertyDetailsDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="titleEl">{t("listForm.propertyTitle")}</Label>
                      <Input
                        id="titleEl"
                        value={formData.titleEl}
                        onChange={handleInputChange}
                        placeholder={t("listForm.titlePlaceholder")}
                        className={formErrors.titleEl ? "border-destructive" : ""}
                      />
                      {formErrors.titleEl && (
                        <p className="text-sm text-destructive mt-1">
                          {formErrors.titleEl}
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

                    <div>
                      <Label htmlFor="address">{t("listForm.address")}</Label>
                      <LocationSearch
                        value={formData.address}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, address: value }));
                          if (formErrors.address) {
                            setFormErrors((prev) => ({
                              ...prev,
                              address: undefined,
                            }));
                          }
                        }}
                        onLocationSelect={(location: LocationResult) => {
                          setFormData((prev) => ({
                            ...prev,
                            address: location.address,
                            city: location.city,
                            postalCode: location.postalCode || prev.postalCode,
                            country: location.country,
                            latitude: location.lat,
                            longitude: location.lon,
                          }));
                        }}
                        placeholder={t("locationSearch.searchAddress")}
                        searchPlaceholder={t("locationSearch.searchAddress")}
                        emptyMessage={t("locationSearch.noLocationsFound")}
                        error={!!formErrors.address}
                        lang={language === "el" ? "el" : "en"}
                      />
                      {formErrors.address && (
                        <p className="text-sm text-destructive mt-1">
                          {formErrors.address}
                        </p>
                      )}
                    </div>

                    <LocationMap
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onLocationChange={async (lat, lon) => {
                        const result = await reverseGeocode(
                          lat,
                          lon,
                          language === "el" ? "el" : "en",
                        );
                        if (result) {
                          setFormData((prev) => ({
                            ...prev,
                            address: result.address,
                            city: result.city,
                            postalCode: result.postalCode || prev.postalCode,
                            country: result.country,
                            latitude: result.lat,
                            longitude: result.lon,
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            latitude: lat,
                            longitude: lon,
                          }));
                        }
                      }}
                      className="mb-4"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">{t("listForm.bedrooms")}</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.bedrooms}
                          onChange={handleInputChange}
                          placeholder="2"
                          className={
                            formErrors.bedrooms ? "border-destructive" : ""
                          }
                        />
                        {formErrors.bedrooms && (
                          <p className="text-sm text-destructive mt-1">
                            {formErrors.bedrooms}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="bathrooms">{t("listForm.bathrooms")}</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.bathrooms}
                          onChange={handleInputChange}
                          placeholder="1"
                          className={
                            formErrors.bathrooms ? "border-destructive" : ""
                          }
                        />
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
                      <Label htmlFor="descriptionEl">
                        {t("listForm.description")}
                      </Label>
                      <Textarea
                        id="descriptionEl"
                        value={formData.descriptionEl}
                        onChange={handleInputChange}
                        placeholder={t("listForm.descriptionPlaceholder")}
                        className="min-h-[120px]"
                      />
                    </div>

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

                  <div className="space-y-4">
                    <div>
                      <Label>{t("listForm.propertyImages")}</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("listForm.imagesHint")}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        isDragging && "border-primary bg-primary/5",
                        !isDragging && "border-border hover:border-primary",
                        canUploadMore && "cursor-pointer",
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
                              canUploadMore
                                ? "text-muted-foreground"
                                : "text-muted",
                            )}
                          />
                          <p
                            className={cn(
                              "text-sm mb-1",
                              canUploadMore
                                ? "text-foreground"
                                : "text-muted-foreground",
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

            {listing && user && (
              <div className="max-w-3xl mx-auto mt-8">
                <AvailabilitySlotsManager listingId={listingId} />
              </div>
            )}
          </div>
    </PageLayout>
  );
};

export default EditListing;
