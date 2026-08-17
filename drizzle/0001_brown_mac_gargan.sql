ALTER TABLE `providers` ADD `is_identity` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `providers` ADD `is_service` integer DEFAULT true NOT NULL;