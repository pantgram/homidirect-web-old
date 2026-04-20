import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { listings } from "modules/listings/listings.model";

export const listingImages = pgTable("listing_images", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 500 }).notNull(),
  listingId: integer("listing_id").references(() => listings.id, {
    onDelete: "cascade",
  }),
  uploadSessionId: varchar("upload_session_id", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
