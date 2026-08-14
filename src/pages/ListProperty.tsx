import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImageUpload } from "@/components/listing/ImageUpload";
import { useCreateListing } from "@/hooks/useListings";
import { LocationSearch } from "@/components/ui/location-search";
import { LocationMap } from "@/components/ui/location-map";
import { reverseGeocode } from "@/api/geocoding";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/shared";
import type { PendingImage } from "@/api/listings";
import type { PropertyType, CreateListingRequest } from "@/api";
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
}

const initialFormData: ListingFormData = {
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
};

const ListProperty = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const createListing = useCreateListing();

  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);
  const [images, setImages] = useState<PendingImage[]>([]);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ListingFormData, string>>
  >({});

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
    if (!formData.city.trim()) {
      errors.city = t("listForm.validation.addressRequired");
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

    const listingData: CreateListingRequest & { uploadSessionId?: string } = {
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
      uploadSessionId: uploadSessionId || undefined,
    };

    try {
      const newListing = await createListing.mutateAsync(listingData);
      toast({
        title: t("listForm.listed"),
        description: t("listForm.listedDesc"),
      });
      navigate(`/listings/${newListing.id}/verification`);
    } catch (err) {
      toast({
        title: t("listForm.error"),
        description: getApiError(err).message || t("listForm.errorDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <PageHeader title={t("listForm.title")} subtitle={t("listForm.subtitle")} />
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
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>{t("listForm.propertyImages")}</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("listForm.imagesHint")}
                    </p>
                  </div>
                  <ImageUpload
                    sessionId={uploadSessionId}
                    onSessionIdChange={setUploadSessionId}
                    images={images}
                    onImagesChange={setImages}
                    maxImages={10}
                    disabled={createListing.isPending}
                  />
                </div>

                <Alert>
                  <AlertDescription>
                    {t("listForm.verificationNote")}
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={createListing.isPending}
                >
                  {createListing.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("listForm.submitting")}
                    </>
                  ) : (
                    t("listForm.submitButton")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
    </PageLayout>
  );
};

export default ListProperty;
