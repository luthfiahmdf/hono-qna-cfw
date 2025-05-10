import { z } from "@hono/zod-openapi"
export const overlaySchema = z.object({
  id: z.string().uuid().openapi({
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  userId: z.string().uuid().openapi({
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  bgColor: z.string().nullable().openapi({ example: "#ffff" }),
  textColor: z.string().nullable().openapi({ example: "#ffff" }),
  border: z.boolean().nullable().openapi({ example: false }),
  fontFamily: z.string().nullable().openapi({ example: "Inter" })

})

export const overlayParamsSchema = z.object({
  id: z.string().uuid().openapi({
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),

})

