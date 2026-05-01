ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "messages" CASCADE;--> statement-breakpoint
ALTER TABLE "listings" DROP CONSTRAINT "listings_title_unique";--> statement-breakpoint
DROP TYPE "public"."message_status";