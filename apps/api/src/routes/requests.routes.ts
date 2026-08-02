import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createRequestSchema, listRequestsQuerySchema, updateRequestSchema } from "@orbital/shared";
import { zodErrorHook } from "../lib/validation.js";
import { requireAuth } from "../middleware/auth.js";
import { requestsService } from "../services/requests.service.js";

// requireAuth передаётся каждому роуту явно (не через .use()) — при монтировании через
// app.route() на общий с health/me префикс /api/v1 общий .use() на под-роутере перехватывал
// вообще все запросы под /api/v1/*, включая чужие роуты и несуществующие пути.
export const requestsRoutes = new Hono()
  .get(
    "/requests",
    requireAuth,
    zValidator("query", listRequestsQuerySchema, zodErrorHook),
    async (c) => {
      const { companyId } = c.get("auth");
      const items = await requestsService.list(companyId, c.req.valid("query"));
      return c.json({ items });
    },
  )
  .post(
    "/requests",
    requireAuth,
    zValidator("json", createRequestSchema, zodErrorHook),
    async (c) => {
      const { companyId } = c.get("auth");
      const created = await requestsService.create(companyId, c.req.valid("json"));
      return c.json(created, 201);
    },
  )
  .get("/requests/:id", requireAuth, async (c) => {
    const { companyId } = c.get("auth");
    const row = await requestsService.get(companyId, c.req.param("id")!);
    return c.json(row);
  })
  .patch(
    "/requests/:id",
    requireAuth,
    zValidator("json", updateRequestSchema, zodErrorHook),
    async (c) => {
      const { companyId } = c.get("auth");
      const row = await requestsService.update(companyId, c.req.param("id")!, c.req.valid("json"));
      return c.json(row);
    },
  )
  .delete("/requests/:id", requireAuth, async (c) => {
    const { companyId } = c.get("auth");
    await requestsService.remove(companyId, c.req.param("id")!);
    return c.body(null, 204);
  });
