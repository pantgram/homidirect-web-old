CREATE TABLE "geoapify_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"query_hash" varchar(64) NOT NULL,
	"query_text" varchar(255) NOT NULL,
	"country_code" varchar(2),
	"lang" varchar(2),
	"results" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "geoapify_cache_query_hash_unique" UNIQUE("query_hash")
);
--> statement-breakpoint
CREATE INDEX "geoapify_cache_hash_idx" ON "geoapify_cache" USING btree ("query_hash");--> statement-breakpoint
CREATE INDEX "geoapify_cache_expires_idx" ON "geoapify_cache" USING btree ("expires_at");