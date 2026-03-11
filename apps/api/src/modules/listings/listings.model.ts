import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  check,
  integer,
  real,
  pgEnum,
  boolean,
  index,
  date,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../users/users.model";

export const propertyTypeEnum = pgEnum("property_type", [
  "apartment",
  "house",
  "studio",
  "room",
]);

export const floorsEnum = pgEnum("floors", [
  "basement",
  "semi-basement",
  "ground",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th+",
]);
export const verificationStatusEnum = pgEnum("verification_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const listings = pgTable(
  "listings",
  {
    id: serial("id").primaryKey(),
    description: text("description").notNull(),
    title: varchar("title", { length: 100 }).notNull().unique(),
    price: real("price").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    postalCode: varchar("postal_code", { length: 50 }),
    floor: floorsEnum("floor").notNull().default("ground"),
    levels: integer("levels").notNull().default(1),
    kitchens: integer("kitchens").notNull().default(1),
    bedrooms: integer("bedrooms").notNull().default(1),
    bathrooms: integer("bathrooms").notNull().default(1),
    area: real("area").notNull(),
    dateAvailable: date("date_available").notNull().defaultNow(),
    dateBuilt: integer("date_built")
      .notNull()
      .default(new Date().getFullYear()),
    views_count: integer("views_count").default(0).notNull(),
    country: varchar("country", { length: 255 }).default("Greece"),
    propertyType: propertyTypeEnum("property_type").notNull(),
    available: boolean("available").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    landlordId: integer("landlord_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Verification fields
    verificationStatus: verificationStatusEnum("verification_status")
      .default("PENDING")
      .notNull(),
    verifiedAt: timestamp("verified_at"),
    verifiedBy: integer("verified_by").references(() => users.id, {
      onDelete: "set null",
    }),

    // Featured listing fields
    isFeatured: boolean("is_featured").default(false).notNull(),
    featuredUntil: timestamp("featured_until"),

    // Bilingual support fields
    titleEl: varchar("title_el", { length: 100 }),
    descriptionEl: text("description_el"),
  },
  (table) => [
    // Check constraints
    check("price", sql`${table.price} >= 0`),
    check("levels", sql`${table.levels} >= 0`),
    check("kitchens", sql`${table.kitchens} >= 0`),
    check("bedrooms", sql`${table.bedrooms} >= 0`),
    check("bathrooms", sql`${table.bathrooms} >= 0`),
    check("area", sql`${table.area} >= 0`),
    check("views_count", sql`${table.views_count} >= 0`),

    // Existing indexes
    index("listings_verification_status_idx").on(table.verificationStatus),
    index("listings_is_featured_idx").on(table.isFeatured),
    index("listings_featured_until_idx").on(table.featuredUntil),
    index("listings_city_idx").on(table.city),
    index("listings_landlord_id_idx").on(table.landlordId),
    // Search optimization indexes
    index("listings_property_type_idx").on(table.propertyType),
    index("listings_price_idx").on(table.price),
    index("listings_bedrooms_idx").on(table.bedrooms),
    index("listings_bathrooms_idx").on(table.bathrooms),
    index("listings_area_idx").on(table.area),
    index("listings_available_idx").on(table.available),
    index("listings_created_at_idx").on(table.createdAt),
    index("listings_country_idx").on(table.country),
    // Composite indexes for common search patterns
    index("listings_available_featured_idx").on(
      table.available,
      table.isFeatured,
    ),
    index("listings_city_price_idx").on(table.city, table.price),
    index("listings_type_city_idx").on(table.propertyType, table.city),
    // Full-text search index (GIN index for tsvector)
    index("listings_search_idx").using(
      "gin",
      sql`to_tsvector('english', coalesce(${table.title}, '') || ' ' || coalesce(${table.description}, ''))`,
    ),
  ],
);

export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
