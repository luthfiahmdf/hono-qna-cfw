import { create } from "domain";
import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 as uuidv7 } from "uuid";
export const users = sqliteTable("users_table", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  username: text("user_name").notNull().unique(),
  password: text("password").notNull(),
  activeQuestion: text("active_question"),
});
export const questions = sqliteTable("questions_table", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name"),
  createAt: text("create_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  question: text("question").notNull(),
});
export const activeQuestions = sqliteTable("active_questions_table", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  updateAt: text("update_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export const userRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  activeQuestions: many(activeQuestions),
}));

export const questionRelations = relations(questions, ({ one }) => ({
  user: one(users, {
    fields: [questions.userId],
    references: [users.id],
  }),
}));

export const activeQuestionRelations = relations(
  activeQuestions,
  ({ one }) => ({
    user: one(users, {
      fields: [activeQuestions.userId],
      references: [users.id],
    }),
    question: one(questions, {
      fields: [activeQuestions.questionId],
      references: [questions.id],
    }),
  })
);
