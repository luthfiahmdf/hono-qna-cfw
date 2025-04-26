PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_questions_table` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text,
	`create_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`question` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_questions_table`("id", "user_id", "name", "create_at", "question") SELECT "id", "user_id", "name", "create_at", "question" FROM `questions_table`;--> statement-breakpoint
DROP TABLE `questions_table`;--> statement-breakpoint
ALTER TABLE `__new_questions_table` RENAME TO `questions_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;