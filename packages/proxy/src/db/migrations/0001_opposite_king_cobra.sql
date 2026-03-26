DROP INDEX IF EXISTS "users_api_key_hash_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "api_key_hash" TO "api_key_hash" text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_api_key_hash_unique` ON `users` (`api_key_hash`);