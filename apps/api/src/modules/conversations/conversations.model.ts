import {
  pgTable,
  serial,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { listings } from "modules/listings/listings.model";
import { users } from "modules/users/users.model";

export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    landlordId: integer("landlord_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("conversations_listing_landlord_tenant_unique").on(
      table.listingId,
      table.landlordId,
      table.tenantId,
    ),
    index("conversations_listing_id_idx").on(table.listingId),
    index("conversations_landlord_id_idx").on(table.landlordId),
    index("conversations_tenant_id_idx").on(table.tenantId),
    index("conversations_last_message_at_idx").on(table.lastMessageAt),
  ],
);

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
