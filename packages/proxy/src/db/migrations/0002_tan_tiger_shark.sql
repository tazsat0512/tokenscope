ALTER TABLE `request_logs` ADD `cached_tokens` integer;--> statement-breakpoint
ALTER TABLE `request_logs` ADD `has_cache_control` integer;--> statement-breakpoint
ALTER TABLE `request_logs` ADD `max_tokens_setting` integer;--> statement-breakpoint
ALTER TABLE `request_logs` ADD `is_streaming` integer;--> statement-breakpoint
ALTER TABLE `request_logs` ADD `tool_count` integer;--> statement-breakpoint
ALTER TABLE `request_logs` ADD `tools_used` text;--> statement-breakpoint
ALTER TABLE `request_logs` ADD `system_prompt_hash` text;