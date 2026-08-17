CREATE TABLE `account_services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` integer NOT NULL,
	`service_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_services_unique` ON `account_services` (`account_id`,`service_id`);--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_id` integer NOT NULL,
	`identifier` text NOT NULL,
	`type` text NOT NULL,
	`purpose` text,
	`created_date` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount_minor` integer NOT NULL,
	`category_id` integer,
	`transaction_mode` text NOT NULL,
	`occurred_at` text NOT NULL,
	`subscription_id` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminder_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_ref_id` integer NOT NULL,
	`fire_at` integer NOT NULL,
	`expo_notification_id` text,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`task_ref_id`) REFERENCES `ticktick_task_refs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`cost_minor` integer NOT NULL,
	`billing_period` text NOT NULL,
	`renewal_date` text NOT NULL,
	`autopay_enabled` integer DEFAULT false NOT NULL,
	`autopay_method` text,
	`category_id` integer,
	`account_id` integer,
	`service_id` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `ticktick_task_refs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticktick_task_id` text NOT NULL,
	`ticktick_project_id` text NOT NULL,
	`title` text NOT NULL,
	`due_at` integer,
	`project_name` text,
	`last_synced_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ticktick_task_refs_ticktick_task_id_unique` ON `ticktick_task_refs` (`ticktick_task_id`);