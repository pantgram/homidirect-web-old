import {
  pgTable,
  serial,
  integer,
  timestamp,
  text,
  index,
} from "drizzle-orm/pg-core";
import {
  listings,
  verificationStatusEnum,
} from "modules/listings/listings.model";
import { users } from "modules/users/users.model";

export const verificationHistory = pgTable(
  "verification_history",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    previousStatus: verificationStatusEnum("previous_status"),
    newStatus: verificationStatusEnum("new_status").notNull(),
    notes: text("notes"),
    reviewedBy: integer("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("verification_history_listing_id_idx").on(table.listingId)],
);

export type VerificationHistoryEntry = typeof verificationHistory.$inferSelect;
export type NewVerificationHistoryEntry =
  typeof verificationHistory.$inferInsert;
