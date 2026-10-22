export {
  apiClient,
  getApiError,
  setAuthExpiredHandler,
  type ApiError,
} from "./client";

export { authApi } from "./auth";
export { listingsApi } from "./listings";
export { usersApi } from "./users";
export { verificationApi } from "./verification";
export { adminVerificationsApi } from "./admin";
export { favoritesApi } from "./favorites";
export { timeSlotsApi } from "./time-slots";

export * from "@/types";

export type { PlatformStats, ContactOwnerRequest } from "./listings";

export type {
  FavoriteToggleResponse,
  FavoriteCheckResponse,
  FavoriteIdsResponse,
} from "./favorites";
