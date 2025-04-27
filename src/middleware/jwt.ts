import { jwt } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET!;

export const requireAuth = jwt({ secret: JWT_SECRET });
