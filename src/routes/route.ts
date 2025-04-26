import { OpenAPIHono } from "@hono/zod-openapi";
import { userController } from "../controller/userController";

const routes = new OpenAPIHono()
  .basePath("/api")
  .route("/users", userController)
  .doc("/doc", {
    openapi: "3.0.3",
    info: {
      version: "1.0.0",
      title: "Hono Qna API",
    },
  });
export type AppType = typeof routes;
export default routes;
export type App = typeof routes;
