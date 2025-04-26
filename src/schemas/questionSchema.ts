import { z } from "@hono/zod-openapi";
export const questionSchema = z.object({
  id: z.string().uuid().openapi({
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  userId: z.string().uuid().openapi({
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  name: z
    .string()
    .min(3)
    .max(50)
    .openapi({
      example: "johndoe",
    })
    .optional()
    .nullable(),
  question: z.string().min(2).max(100).openapi({
    example: "johndoe",
  }),
  createAt: z.string().openapi({
    example: "2023-01-01T00:00:00.000Z",
  }),
});
export const qeustionParamsSchema = z.object({
  slug: z.string().openapi({
    example: "johndoe",
  }),
});
