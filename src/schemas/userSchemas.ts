import { z } from "@hono/zod-openapi";
export const usersSchema = z.object({
  id: z.string().uuid().openapi({
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  username: z.string().min(3).max(50).openapi({
    example: "johndoe",
  }),
  password: z.string().min(6).openapi({
    example: "securePassword123",
  }),
});
