CREATE TYPE "public"."listing_status" AS ENUM('Renovated', 'Luxurious', 'Under construction', 'Neoclassical');--> statement-breakpoint
CREATE TYPE "public"."zone_type" AS ENUM('Residential', 'Agricultural', 'Commercial', 'Industrial', 'Regeneration');--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "elevator" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "parking_space" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "furnished" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "zone_type" "zone_type" DEFAULT 'Residential' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "listing_status" "listing_status";