import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../types/type";
import {
  createActiveQuestion,
  getActiveQuestion,
  updateActiveQuestion,
} from "../routes/activeQuestionRoute";
import { drizzle } from "drizzle-orm/d1";
import { activeQuestions, users, questions } from "../db/schema";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

const activeQuestionController = new OpenAPIHono<Context>()
  .openapi(createActiveQuestion, async (c) => {
    const { slug } = c.req.param();
    const db = drizzle(c.env.DB);
    const questionData = c.req.valid("json");
    const [user] = await db.select().from(users).where(eq(users.id, slug));
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

    const [user] = await db.select().from(users).where(eq(users.id, slug));

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    const [activeQuestion] = await db
      .select()
      .from(activeQuestions)
      .where(eq(activeQuestions.userId, user.id));

    let updated;
    if (!activeQuestion) {
      const [newActiveQuestion] = await db
        .insert(activeQuestions)
        .values({
          userId: user.id,
          questionId: questionData.questionId,
        })
        .returning();
      updated = newActiveQuestion;
    } else {
      const [updatedActiveQuestion] = await db
        .update(activeQuestions)
        .set({
          questionId: questionData.questionId,
        })
        .where(eq(activeQuestions.id, activeQuestion.id))
        .returning();
      updated = updatedActiveQuestion;
    }

    await db
      .update(questions)
      .set({ isViewed: true })
      .where(eq(questions.id, questionData.questionId));

    // Ambil isi pertanyaan
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionData.questionId));

    if (question) {
      const id = c.env.OVERLAY_ROOM.idFromName(slug);
      const stub = c.env.OVERLAY_ROOM.get(id);

      // console.log("Sending to Durable Object overlay:", {
      //   slug,
      //   overlayId: id.toString(),
      //   questionText: question.question,
      //   questionSender: question.name,
      // });
      const url = new URL(c.req.url);
      const origin = url.origin;

      const res = await stub.fetch(`${origin}/send/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: question.question,
          sender: question.name,
        }),
      });

      console.log("Overlay response status:", res.status);
    }

    return c.json(updated, activeQuestion ? 200 : 201);
  })
  .openapi(getActiveQuestion, async (c) => {
    const { slug } = c.req.param();
    const db = drizzle(c.env.DB, { schema });
    const [user] = await db.select().from(users).where(eq(users.id, slug));
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
        sender: activeQuestion.question.name,
        question: activeQuestion.question.question,
      },
      200
    );
  });
export { activeQuestionController };
