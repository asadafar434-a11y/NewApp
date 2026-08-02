import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { subscribe, unsubscribe } from "../lib/sse/index.js";
import { requireAuth } from "../middleware/auth.js";

const HEARTBEAT_MS = 30_000;

export const eventsRoutes = new Hono().get("/events", requireAuth, (c) => {
  const { companyId } = c.get("auth");

  return streamSSE(c, async (stream) => {
    subscribe(companyId, stream);
    stream.onAbort(() => unsubscribe(companyId, stream));

    // Комментарий-строка (": ...") — валидный SSE-пинг, EventSource его игнорирует
    // (не долетает до onmessage/addEventListener), но держит соединение живым через прокси.
    while (!stream.aborted) {
      await stream.write(": ping\n\n");
      await stream.sleep(HEARTBEAT_MS);
    }
  });
});
