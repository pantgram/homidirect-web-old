// Auth hooks
export {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  authKeys,
} from "./useAuth";

// Listings hooks
export {
  useListings,
  useMyListings,
  useSearchListings,
  useFeaturedListings,
  useListing,
  useCreateListing,
  useUpdateListing,
  useDeleteListing,
  useListingImages,
  useListingCoverImage,
  useUploadListingImage,
  useDeleteListingImage,
  listingKeys,
} from "./useListings";

// Time slots hooks (a booking is a claimed slot)
export {
  useMyTimeSlots,
  useListingTimeSlots,
  useAvailableTimeSlots,
  useListingBookings,
  useTimeSlot,
  useCreateTimeSlot,
  useProposeTimeSlot,
  useClaimTimeSlot,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
  timeSlotKeys,
} from "./useTimeSlots";

// Verification hooks
export {
  useVerificationStatus,
  useVerificationDocuments,
  useUploadVerificationDocument,
  useDeleteVerificationDocument,
  verificationKeys,
} from "./useVerification";

// Favorites hooks
export { useFavorites, useMyFavorites, favoritesKeys } from "./useFavorites";
