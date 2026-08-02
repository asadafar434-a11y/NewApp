import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { presignUploadSchema } from "@orbital/shared";
import { presignUpload } from "../lib/storage/index.js";
import { zodErrorHook } from "../lib/validation.js";
import { requireAuth } from "../middleware/auth.js";

export const uploadsRoutes = new Hono().post(
  "/uploads/presign",
  requireAuth,
  zValidator("json", presignUploadSchema, zodErrorHook),
  async (c) => {
    const { companyId } = c.get("auth");
    const { kind, contentType, sizeBytes } = c.req.valid("json");
    const result = await presignUpload(companyId, kind, contentType, sizeBytes);
    return c.json(result);
  },
);
