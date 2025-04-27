import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../types/type";
import { createUser, getUser, getUserMe } from "../routes/userRoutes";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { HTTPException } from "hono/http-exception";

const userController = new OpenAPIHono<Context>()
  .openapi(createUser, async (c) => {
    const userData = c.req.valid("json");
    const db = drizzle(c.env.DB);
    const userExist = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username));

    if (userExist.length > 0) {
      throw new HTTPException(400, {
        message: "User already exists",
      });
    }
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRound);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    return c.json(user, 200);
  })
  .openapi(getUser, async (c) => {
    const db = drizzle(c.env.DB);
    const usersData = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users);
    return c.json(usersData, 200);
  })
  .openapi(getUserMe, async (c) => {
    const db = drizzle(c.env.DB);

    const userId = c.get("jwtPayload");
    const id = userId.id;

    const user = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user.length) {
      return c.json({ message: "User not found" }, 400);
    }

    return c.json(user[0], 200);
  });
export { userController };
