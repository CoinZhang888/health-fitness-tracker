CREATE TABLE `goals` (
	`user_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`date` text NOT NULL,
	`data` text NOT NULL,
	PRIMARY KEY(`user_id`, `id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text
);
