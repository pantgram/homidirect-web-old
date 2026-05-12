// src/db/index.ts
import { users } from "modules/users/users.model";
import { bookings } from "modules/bookings/bookings.model";
import { listingImages } from "modules/listingImages/listingImages.model";
import { listings } from "modules/listings/listings.model";
import { interestedListings } from "models/interestedListings.model";
import { geocodingCache } from "modules/geocoding/geocoding.model";
import { availabilitySlots } from "modules/availabilitySlots/availabilitySlots.model";
import { conversations } from "modules/conversations/conversations.model";
import { featuredListingPurchases } from "modules/featuredListingPurchases/featuredListingPurchases.model";
import { verificationDocuments } from "modules/verificationDocuments/verificationDocuments.model";
import { verificationHistory } from "modules/verificationHistory/verificationHistory.model";
import {
  usersRelations,
  listingsRelations,
  bookingsRelations,
  interestedListingsRelations,
  listingImagesRelations,
  availabilitySlotsRelations,
  conversationsRelations,
  featuredListingPurchasesRelations,
  verificationDocumentsRelations,
  verificationHistoryRelations,
} from "./relations";

// Export schema object for Drizzle
export const schema = {
  users,
  bookings,
  listingImages,
  listings,
  interestedListings,
  geocodingCache,
  availabilitySlots,
  conversations,
  featuredListingPurchases,
  verificationDocuments,
  verificationHistory,
  usersRelations,
  listingsRelations,
  bookingsRelations,
  interestedListingsRelations,
  listingImagesRelations,
  availabilitySlotsRelations,
  conversationsRelations,
  featuredListingPurchasesRelations,
  verificationDocumentsRelations,
  verificationHistoryRelations,
};
