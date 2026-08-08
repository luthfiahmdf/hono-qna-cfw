import { Context as HonoContext, MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { Env } from "..";

export const rateLimiterMiddleware: MiddlewareHandler<{
  Bindings: Env;
}> = async (c, next) => {
  const slug = c.req.param("slug");
  
  // Get IP address from Cloudflare headers
  const ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For") ||
    "unknown";

  // Create unique identifier: IP + slug
  const identifier = `${ip}:${slug}`;

  // Get RateLimiter Durable Object
  const id = c.env.RATE_LIMITER.idFromName(identifier);
  const stub = c.env.RATE_LIMITER.get(id);

  // Check rate limit
  const response = await stub.fetch("http://internal/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });

  const result = await response.json<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
    limit: number;
  }>();

  // Set rate limit headers
  c.header("X-RateLimit-Limit", result.limit.toString());
  c.header("X-RateLimit-Remaining", result.remaining.toString());
  c.header("X-RateLimit-Reset", Math.floor(result.resetAt / 1000).toString());

  if (!result.allowed) {
    // Calculate retry after in seconds
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    c.header("Retry-After", retryAfter.toString());

    throw new HTTPException(429, {
      message: "Too many requests. Please try again later.",
    });
  }

  await next();
};
