import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../types/type";
import {
  createActiveQuestion,
  getActiveQuestion,
  updateActiveQuestion,
} from "../routes/activeQuestionRoute";
import { drizzle } from "drizzle-orm/d1";
import { activeQuestions, users } from "../db/schema";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

const activeQuestionController = new OpenAPIHono<Context>()
  .openapi(createActiveQuestion, async (c) => {
    const { slug } = c.req.param();
    const db = drizzle(c.env.DB);
    const questionData = c.req.valid("json");
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, slug));
    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }
    const [activeQuestionData] = await db
      .insert(activeQuestions)
      .values({
        userId: user.id,
        questionId: questionData.questionId,
      })
      .returning();
    return c.json(activeQuestionData, 200);
  })
  .openapi(updateActiveQuestion, async (c) => {
    const { slug } = c.req.param();
    const db = drizzle(c.env.DB);
    const questionData = c.req.valid("json");
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, slug));
    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }
    const [activeQuestionData] = await db
      .insert(activeQuestions)
      .values({
        userId: user.id,
        questionId: questionData.questionId,
      })
      .returning();
    return c.json(activeQuestionData, 200);
  })
  .openapi(getActiveQuestion, async (c) => {
    const { slug } = c.req.param();
    const db = drizzle(c.env.DB, { schema });
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, slug));
    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }
    const [activeQuestion] = await db.query.activeQuestions.findMany({
      where: eq(activeQuestions.userId, user.id),
      with: {
        question: true,
      },
    });

    if (!activeQuestion || !activeQuestion.question) {
      throw new HTTPException(404, { message: "No active question found" });
    }
    return c.json(
      {
        id: activeQuestion.question.id,
        name: activeQuestion.question.name,
        questionId: activeQuestion.question.id,
        question: activeQuestion.question.question,
        createdAt: activeQuestion.question.createAt,
      },
      200
    );
  });
export { activeQuestionController };
