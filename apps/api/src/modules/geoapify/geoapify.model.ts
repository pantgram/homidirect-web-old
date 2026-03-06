import {
  pgTable,
  serial,
  varchar,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const geoapifyCache = pgTable(
  "geoapify_cache",
  {
    id: serial("id").primaryKey(),
    queryHash: varchar("query_hash", { length: 64 }).notNull().unique(),
    queryText: varchar("query_text", { length: 255 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }),
    lang: varchar("lang", { length: 2 }),
    results: jsonb("results").notNull().$type<any[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [
    index("geoapify_cache_hash_idx").on(table.queryHash),
    index("geoapify_cache_expires_idx").on(table.expiresAt),
  ]
);

export type GeoapifyCache = typeof geoapifyCache.$inferSelect;
export type NewGeoapifyCache = typeof geoapifyCache.$inferInsert;
