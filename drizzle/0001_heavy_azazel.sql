CREATE TABLE `overlay_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`border` integer,
	`text_color` text,
	`bg_color` text,
	`font_family` text,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_active_questions_table` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`update_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_active_questions_table`("id", "user_id", "question_id", "update_at") SELECT "id", "user_id", "question_id", "update_at" FROM `active_questions_table`;--> statement-breakpoint
DROP TABLE `active_questions_table`;--> statement-breakpoint
ALTER TABLE `__new_active_questions_table` RENAME TO `active_questions_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;