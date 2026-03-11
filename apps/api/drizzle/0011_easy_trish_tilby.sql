CREATE TYPE "public"."floors" AS ENUM('basement', 'semi-basement', 'ground', '1st', '2nd', '3rd', '4th', '5th', '6th+');--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "floor" "floors" DEFAULT 'ground' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "levels" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "kitchens" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "date_available" date NOT NULL DEFAULT now();--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "date_built" integer DEFAULT 2026 NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "views_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "price" CHECK ("listings"."price" >= 0);--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "levels" CHECK ("listings"."levels" >= 0);--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "kitchens" CHECK ("listings"."kitchens" >= 0);--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "bedrooms" CHECK ("listings"."bedrooms" >= 0);--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "bathrooms" CHECK ("listings"."bathrooms" >= 0);--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "area" CHECK ("listings"."area" >= 0);--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "views_count" CHECK ("listings"."views_count" >= 0);