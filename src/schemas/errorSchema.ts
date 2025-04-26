import { z } from "@hono/zod-openapi";

export const errorSchema = z.object({
  message: z.string().openapi({ example: "Error message" }),
  code: z.number().openapi({ example: 400 }),
});
