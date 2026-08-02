import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { listMessagesQuerySchema, sendMessageSchema } from "@orbital/shared";
import { zodErrorHook } from "../lib/validation.js";
import { requireAuth } from "../middleware/auth.js";
import { conversationsService } from "../services/conversations.service.js";

// requireAuth передаётся каждому роуту явно, не через .use() — см. requests.routes.ts
// (Hono мёрджит .use() под-роутера на весь общий префикс /api/v1, включая соседей).
export const conversationsRoutes = new Hono()
  .get("/conversations", requireAuth, async (c) => {
    const { companyId } = c.get("auth");
    const result = await conversationsService.list(companyId);
    return c.json(result);
  })
  .get(
    "/conversations/:id/messages",
    requireAuth,
    zValidator("query", listMessagesQuerySchema, zodErrorHook),
    async (c) => {
      const { companyId } = c.get("auth");
      const result = await conversationsService.getMessages(
        companyId,
        c.req.param("id")!,
        c.req.valid("query"),
      );
      return c.json(result);
    },
  )
  .post(
    "/conversations/:id/messages",
    requireAuth,
    zValidator("json", sendMessageSchema, zodErrorHook),
    async (c) => {
      const { companyId } = c.get("auth");
      const message = await conversationsService.sendMessage(
        companyId,
        c.req.param("id")!,
        c.req.valid("json").text,
      );
      return c.json(message, 201);
    },
  )
  .post("/conversations/:id/read", requireAuth, async (c) => {
    const { companyId } = c.get("auth");
    await conversationsService.markRead(companyId, c.req.param("id")!);
    return c.body(null, 204);
  });
