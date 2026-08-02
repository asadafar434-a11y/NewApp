import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  changeStatusSchema,
  createSpecialistSchema,
  ERROR_CODES,
  listSpecialistsQuerySchema,
  updateSpecialistSchema,
  uploadKindSchema,
} from "@orbital/shared";
import { zodErrorHook } from "../lib/validation.js";
import { ApiError } from "../middleware/error-handler.js";
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
  })
  .post(
    "/specialists/:id/status",
    requireAuth,
    zValidator("json", changeStatusSchema, zodErrorHook),
    async (c) => {
      const { companyId } = c.get("auth");
      const row = await specialistsService.changeStatus(
        companyId,
        c.req.param("id")!,
        c.req.valid("json").status,
      );
      return c.json(row);
    },
  )
  .get("/specialists/:id/files/:kind", requireAuth, async (c) => {
    const { companyId } = c.get("auth");
    const parsedKind = uploadKindSchema.safeParse(c.req.param("kind"));
    if (!parsedKind.success) {
      throw new ApiError(400, ERROR_CODES.VALIDATION, "Недопустимый тип файла");
    }
    const url = await specialistsService.getFileUrl(companyId, c.req.param("id")!, parsedKind.data);
    return c.redirect(url, 302);
  });
