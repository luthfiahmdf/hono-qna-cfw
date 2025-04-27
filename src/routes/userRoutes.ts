import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { usersSchema } from "../schemas/userSchemas";
import { errorSchema } from "../schemas/errorSchema";
import { requireAuth } from "../middleware/jwt";

const createUser = createRoute({
  method: "post",
  path: "",
  request: {
    body: jsonContentRequired(usersSchema.omit({ id: true }), "create User"),
  },
  responses: {
    200: jsonContent(usersSchema, "User created"),
    400: jsonContent(errorSchema, "Bad request"),
  },
});
const getUser = createRoute({
  method: "get",
  path: "",
  responses: {
    200: jsonContent(
      usersSchema.omit({ password: true }).array(),
      "get All User"
    ),
    400: jsonContent(errorSchema, "Bad request"),
  },
});
const getUserMe = createRoute({
  method: "get",
  path: "/me",
  middleware: [requireAuth],
  responses: {
    200: jsonContent(usersSchema.omit({ password: true }), "get User"),
    400: jsonContent(errorSchema, "Bad request"),
  },
});
export { createUser, getUser, getUserMe };
