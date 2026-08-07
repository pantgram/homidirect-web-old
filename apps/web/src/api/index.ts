export { apiClient, tokenStorage, getApiError, type ApiError } from "./client";

export { authApi } from "./auth";
export { listingsApi } from "./listings";
export { usersApi } from "./users";
export { verificationApi } from "./verification";
export { favoritesApi } from "./favorites";
export { bookingsApi } from "./bookings";
export { availabilitySlotsApi } from "./availability-slots";

export * from "@/types";

export type {
  PendingImage,
  UploadPendingImageResponse,
  CreateListingWithSessionRequest,
} from "./listings";

export type {
  FavoriteToggleResponse,
  FavoriteCheckResponse,
  FavoriteIdsResponse,
} from "./favorites";
