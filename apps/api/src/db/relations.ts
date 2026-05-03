import { relations } from "drizzle-orm";
import { users } from "modules/users/users.model";
import { listings } from "modules/listings/listings.model";
import { bookings } from "modules/bookings/bookings.model";
import { listingImages } from "modules/listingImages/listingImages.model";
import { interestedListings } from "models/interestedListings.model";
import { availabilitySlots } from "modules/availabilitySlots/availabilitySlots.model";
import { conversations } from "modules/conversations/conversations.model";
import { featuredListingPurchases } from "modules/featuredListingPurchases/featuredListingPurchases.model";
import { verificationDocuments } from "modules/verificationDocuments/verificationDocuments.model";
import { verificationHistory } from "modules/verificationHistory/verificationHistory.model";

// USERS
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings, { relationName: "landlord" }),
  verifiedListings: many(listings, { relationName: "verifier" }),
  tenantBookings: many(bookings, { relationName: "tenant" }),
  landlordBookings: many(bookings, { relationName: "landlord" }),
  interestedListings: many(interestedListings),
}));

// LISTINGS
export const listingsRelations = relations(listings, ({ one, many }) => ({
  landlord: one(users, {
    fields: [listings.landlordId],
    references: [users.id],
    relationName: "landlord",
  }),
  verifiedByUser: one(users, {
    fields: [listings.verifiedBy],
    references: [users.id],
    relationName: "verifier",
  }),
  images: many(listingImages),
  bookings: many(bookings),
  interestedUsers: many(interestedListings),
  availabilitySlots: many(availabilitySlots),
  conversations: many(conversations),
  verificationDocuments: many(verificationDocuments),
  verificationHistory: many(verificationHistory),
  featuredPurchases: many(featuredListingPurchases),
}));

// BOOKINGS
// Defines relations for the bookings table, linking each booking to its tenant and landlord via relation names
// for clarity, and associating each booking with a specific listing.
export const bookingsRelations = relations(bookings, ({ one }) => ({
  tenant: one(users, {
    fields: [bookings.candidateId],
    references: [users.id],
    relationName: "tenant",
  }),
  landlord: one(users, {
    fields: [bookings.landlordId],
    references: [users.id],
    relationName: "landlord",
  }),
  listing: one(listings, {
    fields: [bookings.listingId],
    references: [listings.id],
  }),
}));

// INTERESTED LISTINGS
export const interestedListingsRelations = relations(
  interestedListings,
  ({ one }) => ({
    user: one(users, {
      fields: [interestedListings.userId],
      references: [users.id],
    }),
    listing: one(listings, {
      fields: [interestedListings.listingId],
      references: [listings.id],
    }),
  }),
);

// LISTING IMAGES
export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, {
    fields: [listingImages.listingId],
    references: [listings.id],
  }),
}));

// AVAILABILITY SLOTS
export const availabilitySlotsRelations = relations(availabilitySlots, ({ one }) => ({
  listing: one(listings, {
    fields: [availabilitySlots.listingId],
    references: [listings.id],
  }),
  landlord: one(users, {
    fields: [availabilitySlots.landlordId],
    references: [users.id],
  }),
}));

// CONVERSATIONS
export const conversationsRelations = relations(conversations, ({ one }) => ({
  listing: one(listings, {
    fields: [conversations.listingId],
    references: [listings.id],
  }),
  landlord: one(users, {
    fields: [conversations.landlordId],
    references: [users.id],
    relationName: "conversationLandlord",
  }),
  tenant: one(users, {
    fields: [conversations.tenantId],
    references: [users.id],
    relationName: "conversationTenant",
  }),
}));

// FEATURED LISTING PURCHASES
export const featuredListingPurchasesRelations = relations(featuredListingPurchases, ({ one }) => ({
  listing: one(listings, {
    fields: [featuredListingPurchases.listingId],
    references: [listings.id],
  }),
  purchaser: one(users, {
    fields: [featuredListingPurchases.purchasedBy],
    references: [users.id],
  }),
}));

// VERIFICATION DOCUMENTS
export const verificationDocumentsRelations = relations(verificationDocuments, ({ one }) => ({
  listing: one(listings, {
    fields: [verificationDocuments.listingId],
    references: [listings.id],
  }),
  uploader: one(users, {
    fields: [verificationDocuments.uploadedBy],
    references: [users.id],
  }),
}));

// VERIFICATION HISTORY
export const verificationHistoryRelations = relations(verificationHistory, ({ one }) => ({
  listing: one(listings, {
    fields: [verificationHistory.listingId],
    references: [listings.id],
  }),
  reviewer: one(users, {
    fields: [verificationHistory.reviewedBy],
    references: [users.id],
  }),
}));
