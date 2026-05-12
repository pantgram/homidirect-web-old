ALTER TABLE "listings" ADD COLUMN "address" varchar(500);--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "longitude" numeric(10, 7);