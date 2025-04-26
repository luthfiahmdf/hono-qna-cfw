import { createRoute } from "@hono/zod-openapi";
import { jsonContentRequired } from "stoker/openapi/helpers";
import {
  qeustionParamsSchema,
  questionSchema,
} from "../schemas/questionSchema";
import { errorSchema } from "../schemas/errorSchema";
import { requireAuth } from "../middleware/jwt";

const createQuestion = createRoute({
  method: "post",
  path: "/:slug",
  request: {
    params: qeustionParamsSchema,
    body: jsonContentRequired(
      questionSchema.omit({
        userId: true,
        id: true,
        createAt: true,
      }),
      "Create question"
    ),
  },
  responses: {
    200: jsonContentRequired(
      questionSchema.omit({ id: true, createAt: true }),
      "Question created"
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
    params: qeustionParamsSchema,
  },
  responses: {
    200: jsonContentRequired(questionSchema.array(), "get All question"),
    404: jsonContentRequired(errorSchema, "Bad request"),
  },
});
export { createQuestion, getQuestion };
