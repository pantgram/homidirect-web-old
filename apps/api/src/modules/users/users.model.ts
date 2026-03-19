import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "LANDLORD",
  "TENANT",
  "BOTH",
  "ADMIN",
]);

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "BANNED",
  "SUSPENDED",
]);

export const authProviderEnum = pgEnum("auth_provider", [
  "EMAIL",
  "GOOGLE",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: userRoleEnum("role").notNull(),
  status: userStatusEnum("status").notNull().default("ACTIVE"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password"),
  googleId: varchar("google_id", { length: 255 }).unique(),
  authProvider: authProviderEnum("auth_provider").notNull().default("EMAIL"),
  emailVerified: boolean("email_verified").notNull().default(false),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
