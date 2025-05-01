import { Env } from ".";

type Question = { question: string; sender: string };

export class OverlayRoom {
  private socketsPerSlug: Record<string, WebSocket[]> = {};

  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const slug = pathname.split("/").pop();

    // console.log("Incoming request", {
    //   method: request.method,
    //   url: request.url,
    //   upgrade: request.headers.get("Upgrade"),
    // });

    if (!slug) {
      return new Response("Invalid slug", { status: 400 });
    }

    if (
      request.headers.get("Upgrade")?.toLowerCase() === "websocket" &&
      (pathname.startsWith("/status/") || pathname.startsWith("/overlay/"))
    ) {
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];
      server.accept();

      //console.log(`WebSocket connected for slug: ${slug}`);

      if (!this.socketsPerSlug[slug]) {
        this.socketsPerSlug[slug] = [];
      }

      this.socketsPerSlug[slug].push(server);

      // Cleanup on socket close
      server.addEventListener("close", () => {
        this.socketsPerSlug[slug] = this.socketsPerSlug[slug].filter(
          (s: WebSocket) => s !== server
        );
        // console.log(`WebSocket closed for slug: ${slug}`);
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    if (request.method === "POST" && pathname === `/send/${slug}`) {
      try {
        const { text, sender } = await request.json<{
          text: string;
          sender: string;
        }>();
        const question: Question = { question: text, sender };

        await this.state.storage.put(`activeQuestion-${slug}`, question);

        const sockets = this.socketsPerSlug[slug] || [];
        const openSockets = sockets.filter(
          (s: WebSocket) => s.readyState === WebSocket.OPEN
        );
        this.socketsPerSlug[slug] = openSockets;

        for (const socket of openSockets) {
          try {
            socket.send(JSON.stringify(question));
          } catch (e) {
            console.error("Error sending message to WebSocket:", e);
          }
        }

        return new Response("sent", { status: 200 });
      } catch (e) {
        console.error("Error in POST /send:", e);
        return new Response("Failed to send question", { status: 500 });
      }
    }

    if (request.method === "GET" && pathname.startsWith("/overlay/")) {
      console.log("Request path:", pathname);
      const slug = pathname.split("/").pop();
      console.log("Slug extracted:", slug);

      const stored = await this.state.storage.get<Question>(
        `activeQuestion-${slug}`
      );
      if (!stored) {
        return new Response("No active question found", { status: 404 });
      }
      return new Response(JSON.stringify(stored), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }
}
