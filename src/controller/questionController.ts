import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../types/type";
import {
  createQuestion,
  getQuestion,
  updateQuestion,
} from "../routes/questionRoutes";
import { drizzle } from "drizzle-orm/d1";
import { questions, users } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { WebSocketService } from "../services/websocket.service";

const questionController = new OpenAPIHono<Context>()

  .openapi(createQuestion, async (c) => {
    const { slug } = c.req.param();
    const db = drizzle(c.env.DB);
    const questionData = c.req.valid("json");

    const user = await db.select().from(users).where(eq(users.username, slug));

    if (user.length === 0) {
      throw new HTTPException(404, { message: "User not found" });
    }

    const [question] = await db
      .insert(questions)
      .values({
        userId: user[0].id,
        name: questionData.name ? questionData.name : "Anomali",
        question: questionData.question,
        isViewed: false,
      })
      .returning();

    // Emit WebSocket event for new question
    await WebSocketService.emitNewQuestion(c.env, slug, {
      id: question.id,
      name: question.name,
      question: question.question,
      isViewed: question.isViewed,
      createAt: question.createAt,
    });

    // Fetch all questions and emit sync event for auto-refresh
    const allQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.userId, user[0].id))
      .orderBy(desc(questions.createAt));

    await WebSocketService.emitQuestionsSync(c.env, slug, allQuestions);

    return c.json(question, 200);
  })

  .openapi(getQuestion, async (c) => {
    const { slug } = c.req.param();
    const db = drizzle(c.env.DB);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, slug));

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }
    const questionsData = await db
      .select()
      .from(questions)
      .where(eq(questions.userId, user.id))
      .orderBy(desc(questions.createAt));
    return c.json(questionsData.length ? questionsData : [], 200);
  })

  .openapi(updateQuestion, async (c) => {
    const { slug, questionId } = c.req.param();
    const db = drizzle(c.env.DB);
    const updateData = c.req.valid("json");

    const user = await db.select().from(users).where(eq(users.username, slug));

    if (user.length === 0) {
      throw new HTTPException(404, { message: "User not found" });
    }

    // Check if question exists and belongs to the user
    const existingQuestion = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (existingQuestion.length === 0) {
      throw new HTTPException(404, { message: "Question not found" });
    }

    if (existingQuestion[0].userId !== user[0].id) {
      throw new HTTPException(403, { message: "Unauthorized" });
    }

    // Update the question
    const [updatedQuestion] = await db
      .update(questions)
      .set(updateData)
      .where(eq(questions.id, questionId))
      .returning();

    // Emit WebSocket event for question update
    await WebSocketService.emitQuestionUpdate(c.env, slug, {
      id: updatedQuestion.id,
      name: updatedQuestion.name,
      question: updatedQuestion.question,
      isViewed: updatedQuestion.isViewed,
    });

    // Fetch all questions and emit sync event for auto-refresh
    const allQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.userId, user[0].id))
      .orderBy(desc(questions.createAt));

    await WebSocketService.emitQuestionsSync(c.env, slug, allQuestions);

    return c.json(updatedQuestion, 200);
  });

export { questionController };
