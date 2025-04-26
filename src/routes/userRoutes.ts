import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { usersSchema } from "../schemas/userSchemas";
import { errorSchema } from "../schemas/errorSchema";

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
export { createUser };
