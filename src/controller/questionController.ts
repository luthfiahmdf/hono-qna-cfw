import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../types/type";
import { createQuestion, getQuestion } from "../routes/questionRoutes";
import { drizzle } from "drizzle-orm/d1";
import { questions, users } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

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

    return c.json(question, 200);
  })

  .openapi(getQuestion, async (c) => {
    const { slug } = c.req.param();
    const db = drizzle(c.env.DB);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, slug));

    const questionsData = await db
      .select()
      .from(questions)
      .where(eq(questions.userId, user.id))
      .orderBy(desc(questions.createAt));
    return c.json(questionsData, 200);
  });

export { questionController };
