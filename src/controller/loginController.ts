import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../types/type";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { userLoginRoute } from "../routes/loginRoutes";

const userLoginController = new OpenAPIHono<Context>().openapi(
  userLoginRoute,
  async (c) => {
    const db = drizzle(c.env.DB);
    const userData = c.req.valid("json");

    const userExist = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username));
    const user = userExist[0];

    if (!user) {
      throw new HTTPException(401, { message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(
      userData.password,
      user.password
    );

    if (!passwordMatch) {
      return c.json({ message: "Invalid credentials" }, 401);
    }

    const token = await sign(
      {
        id: user.id,
        username: user.username,
      },
      c.env.JWT_SECRET
    );
    return c.json(
      {
        access_token: token,
        message: "User logged in",
      },
      200
    );
  }
);

export { userLoginController };
