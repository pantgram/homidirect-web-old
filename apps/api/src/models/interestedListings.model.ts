import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { listings } from "modules/listings/listings.model";
import { users } from "modules/users/users.model";

export const interestedListings = pgTable(
  "interested_listings", // You might want to rename this to "listing_tags" to match the variable name
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Added onDelete: 'cascade' as a common pattern
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }), // Added onDelete: 'cascade'
  },

  (t) => [
    // Place the primary key definition inside the array
    primaryKey({ columns: [t.userId, t.listingId] }),
  ],
);

export type InterestedListing = typeof interestedListings.$inferSelect;
export type NewInterestedListing = typeof interestedListings.$inferInsert;
