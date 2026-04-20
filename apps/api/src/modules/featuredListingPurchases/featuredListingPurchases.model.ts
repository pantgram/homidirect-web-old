import {
  pgTable,
  serial,
  integer,
  timestamp,
  real,
  varchar,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { listings } from "modules/listings/listings.model";
import { users } from "modules/users/users.model";

export const featuredPurchaseStatusEnum = pgEnum("featured_purchase_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export const featuredListingPurchases = pgTable(
  "featured_listing_purchases",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    purchasedBy: integer("purchased_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: real("amount").notNull(),
    currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
    status: featuredPurchaseStatusEnum("status").default("PENDING").notNull(),
    startsAt: timestamp("starts_at").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    paymentReference: varchar("payment_reference", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("featured_purchases_listing_id_idx").on(table.listingId),
    index("featured_purchases_status_idx").on(table.status),
    index("featured_purchases_expires_at_idx").on(table.expiresAt),
  ],
);

export type FeaturedListingPurchase =
  typeof featuredListingPurchases.$inferSelect;
export type NewFeaturedListingPurchase =
  typeof featuredListingPurchases.$inferInsert;
