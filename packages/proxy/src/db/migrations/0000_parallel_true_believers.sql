CREATE TABLE `ewma_states` (
	`user_id` text PRIMARY KEY NOT NULL,
	`ewma_value` real DEFAULT 0 NOT NULL,
	`ewma_variance` real DEFAULT 0 NOT NULL,
	`last_updated` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `loop_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_id` text,
	`agent_id` text,
	`prompt_hash` text NOT NULL,
	`match_count` integer NOT NULL,
	`similarity` real,
	`detected_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `request_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_id` text,
	`agent_id` text,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`input_tokens` integer NOT NULL,
	`output_tokens` integer NOT NULL,
	`cost_usd` real NOT NULL,
	`prompt_hash` text NOT NULL,
	`latency_ms` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`blocked` integer DEFAULT false NOT NULL,
	`block_reason` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`api_key_hash` text NOT NULL,
	`provider_keys_encrypted` text DEFAULT '{}' NOT NULL,
	`budget_limit_usd` real,
	`slack_webhook_url` text,
	`plan` text DEFAULT 'free' NOT NULL,
	`stripe_customer_id` text,
	`request_count` integer DEFAULT 0 NOT NULL,
	`request_count_reset_at` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_api_key_hash_unique` ON `users` (`api_key_hash`);