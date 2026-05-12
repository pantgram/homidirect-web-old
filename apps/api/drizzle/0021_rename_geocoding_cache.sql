ALTER TABLE "geoapify_cache" RENAME TO "geocoding_cache";--> statement-breakpoint
ALTER INDEX "geoapify_cache_hash_idx" RENAME TO "geocoding_cache_hash_idx";--> statement-breakpoint
ALTER INDEX "geoapify_cache_expires_idx" RENAME TO "geocoding_cache_expires_idx";
