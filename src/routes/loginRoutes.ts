import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { errorSchema } from "../schemas/errorSchema";
import { loginResponseSchema, loginSchema } from "../schemas/userSchemas";

const userLoginRoute = createRoute({
  method: "post",
  path: "",
  request: {
    body: jsonContentRequired(loginSchema, "Login user"),
  },
  responses: {
    200: jsonContent(loginResponseSchema, "User logged in"),
    401: jsonContent(errorSchema, "Unauthorized"),
  },
});
export { userLoginRoute };
