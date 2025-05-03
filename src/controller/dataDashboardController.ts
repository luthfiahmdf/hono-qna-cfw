import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../types/type";
import { getDataDashboard } from "../routes/dashboardDataRoute";
import { drizzle } from "drizzle-orm/d1";
import { questions, users } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
const getDataDashboardController = new OpenAPIHono<Context>().openapi(
  getDataDashboard,
  async (c) => {
    const { slug } = c.req.param();
    const db = drizzle(c.env.DB);
    const [user] = await db.select().from(users).where(eq(users.id, slug));
    console.log("slug param:", slug);

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    const [dataDashboard] = await db
      .select({ totalQuestion: sql<number>`count(${questions.question})` })
      .from(questions)
      .where(eq(questions.userId, slug));


    return c.json(
      {
        totalQuestion: dataDashboard.totalQuestion ?? 0,
      },
      200
    );

  }
);

export { getDataDashboardController };
