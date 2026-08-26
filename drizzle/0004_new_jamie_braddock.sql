DROP TABLE `account_services`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
DROP TABLE `services`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`cost_minor` integer NOT NULL,
	`billing_period` text NOT NULL,
	`renewal_date` text NOT NULL,
	`autopay_enabled` integer DEFAULT false NOT NULL,
	`autopay_method` text,
	`category_id` integer,
	`inactive_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_subscriptions`("id", "name", "cost_minor", "billing_period", "renewal_date", "autopay_enabled", "autopay_method", "category_id", "inactive_at", "created_at", "updated_at") SELECT "id", "name", "cost_minor", "billing_period", "renewal_date", "autopay_enabled", "autopay_method", "category_id", "inactive_at", "created_at", "updated_at" FROM `subscriptions`;--> statement-breakpoint
DROP TABLE `subscriptions`;--> statement-breakpoint
ALTER TABLE `__new_subscriptions` RENAME TO `subscriptions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `providers` DROP COLUMN `sort_order`;--> statement-breakpoint
ALTER TABLE `providers` DROP COLUMN `is_identity`;--> statement-breakpoint
ALTER TABLE `providers` DROP COLUMN `is_service`;