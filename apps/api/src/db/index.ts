// src/db/index.ts
import { users } from "../modules/users/users.model";
import { bookings } from "../modules/bookings/bookings.model";
import { listingImages } from "../modules/listingImages/listingImages.model";
import { listings } from "../modules/listings/listings.model";
import { tags } from "../modules/tags/tags.model";
import { interestedListings } from "../models/interestedListings.model";
import { listingTags } from "../models/listingTags.model";
import { geoapifyCache } from "../modules/geoapify/geoapify.model";
import {
  usersRelations,
  listingsRelations,
  bookingsRelations,
  tagsRelations,
  listingTagsRelations,
  interestedListingsRelations,
  listingImagesRelations,
} from "./relations";

// Export schema object for Drizzle
export const schema = {
  users,
  bookings,
  listingImages,
  listings,
  tags,
  interestedListings,
  listingTags,
  geoapifyCache,
  usersRelations,
  listingsRelations,
  bookingsRelations,
  tagsRelations,
  listingTagsRelations,
  interestedListingsRelations,
  listingImagesRelations,
};
