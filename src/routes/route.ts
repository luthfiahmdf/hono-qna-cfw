import { OpenAPIHono } from "@hono/zod-openapi";
import { userController } from "../controller/userController";
import { userLoginController } from "../controller/loginController";
import { questionController } from "../controller/questionController";
import { activeQuestionController } from "../controller/activeQuestionController";

const routes = new OpenAPIHono()
  .basePath("/api")
  .route("/users", userController)
  .route("/login", userLoginController)
  .route("/questions", questionController)
  .route("/activeQuestions", activeQuestionController)
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
