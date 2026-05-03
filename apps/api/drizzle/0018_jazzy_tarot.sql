ALTER TABLE "tags" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "listing_tags" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "tags" CASCADE;--> statement-breakpoint
DROP TABLE "listing_tags" CASCADE;--> statement-breakpoint