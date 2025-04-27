import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { SmartRouter } from "hono/router/smart-router";
import { TrieRouter } from "hono/router/trie-router";
import routes from "./routes/route";

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
};
const app = new Hono<{ Bindings: Env }>({
  router: new SmartRouter({ routers: [new RegExpRouter(), new TrieRouter()] }),
})
  .use(logger())
  .use(prettyJSON())
  .use(
    cors({
      origin: ["http://localhost:3000", "https://tanya-tanyain.vercel.app"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Length", "X-Requested-With"],
      maxAge: 600,
      credentials: true,
    })
  )
  .route("", routes)
  .get("/ui", Scalar({ url: "/api/doc", theme: "elysiajs" }))
  .get("/", (c) => c.json({ message: `Hello Hono!🔥 ` }));

export default app;
