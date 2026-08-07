import { useState, useCallback, useRef } from "react";
import { Upload, X, ImageIcon, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { listingsApi, type PendingImage } from "@/api/listings";
import { getApiError } from "@/api";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSessionIdRef = useRef<string | null>(sessionId);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  currentSessionIdRef.current = sessionId;

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t("imageUpload.invalidType");
    }
    if (file.size > MAX_FILE_SIZE) {
      return t("imageUpload.fileTooLarge");
    }
    return null;
  }, [t]);

  const uploadFile = useCallback(async (file: File): Promise<PendingImage | null> => {
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
    } catch (err) {
      toast({
        title: t("imageUpload.uploadError"),
        description: getApiError(err).message || t("imageUpload.uploadFailed"),
        variant: "destructive",
      });
      return null;
    }
  }, [validateFile, t, onSessionIdChange]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
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
  }, [maxImages, images, t, uploadFile, onImagesChange]);

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
    } catch (err) {
      toast({
        title: t("imageUpload.removeError"),
        description: getApiError(err).message || t("imageUpload.removeFailed"),
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
    </div>
  );
}
