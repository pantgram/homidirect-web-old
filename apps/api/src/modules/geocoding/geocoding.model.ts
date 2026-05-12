import {
  pgTable,
  serial,
  varchar,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const geocodingCache = pgTable(
  "geocoding_cache",
  {
    id: serial("id").primaryKey(),
    queryHash: varchar("query_hash", { length: 64 }).notNull().unique(),
    queryText: varchar("query_text", { length: 500 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }),
    lang: varchar("lang", { length: 2 }),
    results: jsonb("results").notNull().$type<any[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [
    index("geocoding_cache_hash_idx").on(table.queryHash),
    index("geocoding_cache_expires_idx").on(table.expiresAt),
  ]
);

export type GeocodingCache = typeof geocodingCache.$inferSelect;
export type NewGeocodingCache = typeof geocodingCache.$inferInsert;
