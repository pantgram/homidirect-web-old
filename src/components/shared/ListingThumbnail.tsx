import { useListingCoverImage } from "@/hooks/useListings";
import { getImageUrl } from "@/utils/image";

interface ListingThumbnailProps {
  listingId: number;
  fallbackUrl: string;
  alt: string;
  className?: string;
}

export function ListingThumbnail({
  listingId,
  fallbackUrl,
  alt,
  className,
}: ListingThumbnailProps) {
  const { data: coverUrl } = useListingCoverImage(listingId);

  return (
    <img
      src={coverUrl ? getImageUrl(coverUrl) : fallbackUrl}
      alt={alt}
      className={className}
    />
  );
}
