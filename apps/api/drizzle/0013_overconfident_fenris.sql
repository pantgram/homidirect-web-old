ALTER TABLE "listings" ALTER COLUMN "date_available" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "title_el" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "description_el" SET DEFAULT '' ;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "title_en" varchar(100);--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "description_en" text;