import { OpenAPIHono } from "@hono/zod-openapi";
import { Env } from "..";

export const rateLimiterController = new OpenAPIHono<{ Bindings: Env }>()
  .post("/check", async (c) => {
    try {
      const { identifier } = await c.req.json<{ identifier: string }>();
      
      if (!identifier) {
        return c.json({ error: "Identifier is required" }, 400);
      }

      // Get rate limiter stub
      const id = c.env.RATE_LIMITER.idFromName(identifier);
      const stub = c.env.RATE_LIMITER.get(id);

      // Forward request to Durable Object
      const request = new Request("http://internal/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const response = await stub.fetch(request);
      const result = await response.json();

      return c.json(result);
    } catch (error) {
      console.error("Rate limiter error:", error);
      return c.json({ error: "Failed to check rate limit" }, 500);
    }
  });
