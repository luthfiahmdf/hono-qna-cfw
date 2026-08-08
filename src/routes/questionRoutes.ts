import { createRoute } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { z } from "@hono/zod-openapi";
import {
  questionParamsSchema,
  questionSchema,
} from "../schemas/questionSchema";
import { errorSchema } from "../schemas/errorSchema";
import { requireAuth } from "../middleware/jwt";
import { rateLimiterMiddleware } from "../middleware/rateLimiter";

const createQuestion = createRoute({
  middleware: [rateLimiterMiddleware],
  method: "post",
  path: "/:slug",
  request: {
    params: questionParamsSchema,
    body: jsonContentRequired(
      questionSchema.omit({
        userId: true,
        id: true,
        createAt: true,
        isViewed: true,
      }),
      "Create question",
    ),
  },
  responses: {
    200: jsonContentRequired(
      questionSchema.omit({ id: true, createAt: true }),
      "Question created",
    ),
    400: jsonContentRequired(errorSchema, "Bad request"),
    404: jsonContentRequired(errorSchema, "Not found"),
  },
});
const getQuestion = createRoute({
  middleware: [requireAuth],
  method: "get",
  path: "/:slug",
  request: {
    params: questionParamsSchema,
  },
  responses: {
    200: jsonContent(questionSchema.array(), "get All question"),
  },
});

const updateQuestion = createRoute({
  middleware: [requireAuth],
  method: "put",
  path: "/:slug/:questionId",
  request: {
    params: questionParamsSchema.extend({
      questionId: z.string().uuid().openapi({
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
    }),
    body: jsonContentRequired(
      questionSchema
        .pick({
          isViewed: true,
        })
        .partial(),
      "Update question",
    ),
  },
  responses: {
    200: jsonContentRequired(questionSchema, "Question updated"),
    400: jsonContentRequired(errorSchema, "Bad request"),
    404: jsonContentRequired(errorSchema, "Not found"),
  },
});

export { createQuestion, getQuestion, updateQuestion };
