import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "modules/users/users.model";
import { listings } from "modules/listings/listings.model";
import { availabilitySlots } from "modules/availabilitySlots/availabilitySlots.model";

export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "CONFIRMED",
  "DECLINED",
  "CANCELLED",
]);

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    status: bookingStatusEnum("status").default("PENDING"),
    scheduledAt: timestamp("scheduled_at").notNull(),
    meetLink: varchar("meet_link", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),

    candidateId: integer("candidate_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    landlordId: integer("landlord_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),

    availabilitySlotId: integer("availability_slot_id").references(
      () => availabilitySlots.id,
      { onDelete: "set null" },
    ),
  },
  (table) => [
    index("bookings_candidate_id_idx").on(table.candidateId),
    index("bookings_landlord_id_idx").on(table.landlordId),
    index("bookings_listing_id_idx").on(table.listingId),
    index("bookings_availability_slot_id_idx").on(table.availabilitySlotId),
  ],
);

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
