import { z } from "@hono/zod-openapi";
export const paramsDashboardSchema = z.object({
  slug: z.string().openapi({
    example: "johndoe",
  }),
});
export const responseDashboardSchema = z.object({
  totalQuestion: z.number().openapi({
    example: 12,
  }),
});
