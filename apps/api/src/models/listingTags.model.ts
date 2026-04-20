import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { listings } from "modules/listings/listings.model";
import { tags } from "modules/tags/tags.model";

export const listingTags = pgTable(
  "listing_tags", // You might want to rename this to "listing_tags" to match the variable name
  {
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }), // Added onDelete: 'cascade' as a common pattern
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }), // Added onDelete: 'cascade'
  },

  (t) => [
    // Place the primary key definition inside the array
    primaryKey({ columns: [t.tagId, t.listingId] }),
  ],
);

export type ListingTag = typeof listingTags.$inferSelect;
export type NewListingTag = typeof listingTags.$inferInsert;
