import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { listings } from "modules/listings/listings.model";
import { users } from "modules/users/users.model";

export const documentTypeEnum = pgEnum("document_type", [
  "UTILITY_BILL",
  "TITLE_DEED",
  "LEASE_AGREEMENT",
  "PROPERTY_TAX",
  "OTHER",
]);

export const verificationDocuments = pgTable(
  "verification_documents",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    documentType: documentTypeEnum("document_type").notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    uploadedBy: integer("uploaded_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("verification_docs_listing_id_idx").on(table.listingId)],
);

export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type NewVerificationDocument = typeof verificationDocuments.$inferInsert;
