import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { qeustionParamsSchema } from "../schemas/questionSchema";
import {
  activeQuestionSchema,
  responseActiveQuestionSchema,
} from "../schemas/activeQuestionSchema";
import { createRoute } from "@hono/zod-openapi";
import { errorSchema } from "../schemas/errorSchema";
import { requireAuth } from "../middleware/jwt";

const createActiveQuestion = createRoute({
  method: "post",
  path: "/:slug",
  request: {
    params: qeustionParamsSchema,
    body: jsonContentRequired(
      activeQuestionSchema.omit({
        id: true,
        createAt: true,
        userId: true,
      }),
      "Create question"
    ),
  },
  responses: {
    200: jsonContentRequired(
      activeQuestionSchema.omit({ id: true, createAt: true }),
      "Question created"
    ),
    400: jsonContentRequired(errorSchema, "Bad request"),
    404: jsonContentRequired(errorSchema, "Not found"),
  },
});
const updateActiveQuestion = createRoute({
  middleware: [requireAuth],
  method: "put",
  path: "/:slug",
  request: {
    params: qeustionParamsSchema,
    body: jsonContentRequired(
      activeQuestionSchema.omit({
        userId: true,
        id: true,
        createAt: true,
      }),
      "Create question"
    ),
  },
  responses: {
    200: jsonContent(
      activeQuestionSchema.omit({ id: true, createAt: true }),
      "Question created"
    ),
    400: jsonContent(errorSchema, "Bad request"),
    404: jsonContent(errorSchema, "Not found"),
  },
});

const getActiveQuestion = createRoute({
  method: "get",
  middleware: [requireAuth],
  path: "/:slug",
  request: { params: qeustionParamsSchema },
  responses: {
    200: jsonContent(responseActiveQuestionSchema, "Question created"),
    400: jsonContent(errorSchema, "Bad request"),
    404: jsonContent(errorSchema, "Not found"),
  },
});
export { createActiveQuestion, updateActiveQuestion, getActiveQuestion };
