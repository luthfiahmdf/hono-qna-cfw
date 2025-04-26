import { jwt } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const requireAuth = jwt({ secret: JWT_SECRET });
