import { Hono } from "hono";
import { ERROR_CODES } from "@orbital/shared";
import { auth } from "../lib/auth.js";

/**
 * Минимальная версия — только чтобы проверить requireVerifiedEmail (T-013).
 * Полноценный /me с company/role и ctx-паттерном — T-016.
 */
export const meRoutes = new Hono().get("/me", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: { code: ERROR_CODES.UNAUTHORIZED, message: "Требуется вход" } }, 401);
  }
  return c.json({ user: session.user });
});
