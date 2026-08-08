import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { SmartRouter } from "hono/router/smart-router";
import { TrieRouter } from "hono/router/trie-router";
import routes from "./routes/route";
import { OverlayRoom } from "./overlay-room";
import { RateLimiter } from "./rate-limiter";

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
  OVERLAY_ROOM: DurableObjectNamespace;
  RATE_LIMITER: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Env }>({
  router: new SmartRouter({ routers: [new RegExpRouter(), new TrieRouter()] }),
})
  .use(logger())
  .use(prettyJSON())
  .use(
    cors({
      origin: "*", // Allow all origins for development
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Length", "X-Requested-With"],
      maxAge: 600,
      credentials: false, // Set to false when using wildcard origin
    }),
  )
  .route("", routes)
  .get("/overlay/:slug", async (c) => {
    const slug = c.req.param("slug");
    const stub = c.env.OVERLAY_ROOM.get(c.env.OVERLAY_ROOM.idFromName(slug));
    return stub.fetch(c.req.raw);
  })
  .get("/status/:slug", async (c) => {
    const slug = c.req.param("slug");
    const stub = c.env.OVERLAY_ROOM.get(c.env.OVERLAY_ROOM.idFromName(slug));
    return stub.fetch(c.req.raw);
  })
  .get("/ui", Scalar({ url: "/api/doc", theme: "elysiajs" }))

  .get("/", (c) => c.json({ message: `Hello Hono!🔥 ` }));

export default app;
export { OverlayRoom, RateLimiter };
