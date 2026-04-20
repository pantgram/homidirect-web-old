import {
  pgTable,
  serial,
  integer,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { listings } from "modules/listings/listings.model";
import { users } from "modules/users/users.model";

export const availabilitySlots = pgTable(
  "availability_slots",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    landlordId: integer("landlord_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    isBooked: boolean("is_booked").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("availability_slots_listing_id_idx").on(table.listingId),
    index("availability_slots_landlord_id_idx").on(table.landlordId),
    index("availability_slots_start_time_idx").on(table.startTime),
    index("availability_slots_is_booked_idx").on(table.isBooked),
  ],
);

export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type NewAvailabilitySlot = typeof availabilitySlots.$inferInsert;
