DROP INDEX "listings_search_idx";--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "title_el" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "description_el" SET DEFAULT '';--> statement-breakpoint
CREATE INDEX "listings_search_en_idx" ON "listings" USING gin (to_tsvector('english', coalesce("title_en", '') || ' ' || coalesce("description", '')));--> statement-breakpoint
CREATE INDEX "listings_search_el_idx" ON "listings" USING gin (to_tsvector('greek', coalesce("title_el", '') || ' ' || coalesce("description", '')));