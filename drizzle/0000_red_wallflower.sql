CREATE TABLE `users_table` (
	`id` text PRIMARY KEY NOT NULL,
	`user_name` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_user_name_unique` ON `users_table` (`user_name`);