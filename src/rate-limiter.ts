import { Env } from ".";

interface RateLimitData {
  count: number;
  windowStart: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export class RateLimiter {
  private state: DurableObjectState;
  private env: Env;
  private readonly WINDOW_MS = 60000; // 1 minute in milliseconds
  private readonly MAX_REQUESTS = 50;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle rate limit check
    if (request.method === "POST" && pathname === "/check") {
      try {
        const { identifier } = await request.json<{ identifier: string }>();
        const result = await this.checkRateLimit(identifier);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error checking rate limit:", error);
        return new Response("Failed to check rate limit", { status: 500 });
      }
    }

    return new Response("Not found", { status: 404 });
  }

  private async checkRateLimit(identifier: string): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();

    // Get current rate limit data
    const data = await this.state.storage.get<RateLimitData>(key);

    if (!data) {
      // First request - initialize
      const newData: RateLimitData = {
        count: 1,
        windowStart: now,
      };
      await this.state.storage.put(key, newData);

      return {
        allowed: true,
        remaining: this.MAX_REQUESTS - 1,
        resetAt: now + this.WINDOW_MS,
        limit: this.MAX_REQUESTS,
      };
    }

    // Check if window has expired
    const windowExpired = now >= data.windowStart + this.WINDOW_MS;

    if (windowExpired) {
      // Reset window
      const newData: RateLimitData = {
        count: 1,
        windowStart: now,
      };
      await this.state.storage.put(key, newData);

      return {
        allowed: true,
        remaining: this.MAX_REQUESTS - 1,
        resetAt: now + this.WINDOW_MS,
        limit: this.MAX_REQUESTS,
      };
    }

    // Window is still active
    if (data.count >= this.MAX_REQUESTS) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetAt: data.windowStart + this.WINDOW_MS,
        limit: this.MAX_REQUESTS,
      };
    }

    // Increment counter
    const newData: RateLimitData = {
      count: data.count + 1,
      windowStart: data.windowStart,
    };
    await this.state.storage.put(key, newData);

    return {
      allowed: true,
      remaining: this.MAX_REQUESTS - newData.count,
      resetAt: data.windowStart + this.WINDOW_MS,
      limit: this.MAX_REQUESTS,
    };
  }
}
