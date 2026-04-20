import {
  pgTable,
  serial,
  integer,
  timestamp,
  text,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { conversations } from "modules/conversations/conversations.model";
import { users } from "modules/users/users.model";

export const messageStatusEnum = pgEnum("message_status", [
  "SENT",
  "DELIVERED",
  "READ",
]);

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: integer("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    status: messageStatusEnum("status").default("SENT").notNull(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversation_id_idx").on(table.conversationId),
    index("messages_sender_id_idx").on(table.senderId),
    index("messages_created_at_idx").on(table.createdAt),
    index("messages_status_idx").on(table.status),
  ],
);

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
