import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  createSpecialistSchema,
  listSpecialistsQuerySchema,
  updateSpecialistSchema,
} from "@orbital/shared";
import { zodErrorHook } from "../lib/validation.js";
import { requireAuth } from "../middleware/auth.js";
import { specialistsService } from "../services/specialists.service.js";

// requireAuth передаётся каждому роуту явно, не через .use() — см. requests.routes.ts
// (Hono мёрджит .use() под-роутера на весь общий префикс /api/v1, включая соседей).
export const specialistsRoutes = new Hono()
  .get(
    "/specialists",
    requireAuth,
    zValidator("query", listSpecialistsQuerySchema, zodErrorHook),
    async (c) => {
      const { companyId } = c.get("auth");
      const result = await specialistsService.list(companyId, c.req.valid("query"));
      return c.json(result);
    },
  )
  .post(
    "/specialists",
    requireAuth,
    zValidator("json", createSpecialistSchema, zodErrorHook),
    async (c) => {
      const { companyId } = c.get("auth");
      const created = await specialistsService.create(companyId, c.req.valid("json"));
      return c.json(created, 201);
    },
  )
  .get("/specialists/:id", requireAuth, async (c) => {
    const { companyId } = c.get("auth");
    const row = await specialistsService.get(companyId, c.req.param("id")!);
    return c.json(row);
  })
  .patch(
    "/specialists/:id",
    requireAuth,
    zValidator("json", updateSpecialistSchema, zodErrorHook),
    async (c) => {
      const { companyId } = c.get("auth");
      const row = await specialistsService.update(
        companyId,
        c.req.param("id")!,
        c.req.valid("json"),
      );
      return c.json(row);
    },
  )
  .delete("/specialists/:id", requireAuth, async (c) => {
    const { companyId } = c.get("auth");
    await specialistsService.remove(companyId, c.req.param("id")!);
    return c.body(null, 204);
  });
