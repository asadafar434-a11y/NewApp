import type { Context, Next } from "hono";
import { ERROR_CODES } from "@orbital/shared";
import { auth } from "../lib/auth.js";
import { ApiError } from "./error-handler.js";

const EXEMPT_PATHS = ["/api/v1/health"];
const EXEMPT_PREFIXES = ["/api/v1/auth/"];

/**
 * Глобальная проверка: если сессия есть, но email не подтверждён — 403 на все
 * маршруты, кроме auth-эндпоинтов и health (docs/07-auth-and-security.md, «Регистрация»).
 * Полноценный auth-middleware с ctx {userId, companyId, role} — T-016.
 */
export async function requireVerifiedEmail(c: Context, next: Next) {
  const path = c.req.path;
  if (EXEMPT_PATHS.includes(path) || EXEMPT_PREFIXES.some((p) => path.startsWith(p))) {
    return next();
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (session && !session.user.emailVerified) {
    throw new ApiError(403, ERROR_CODES.EMAIL_NOT_VERIFIED, "Подтвердите email, чтобы продолжить");
  }

  return next();
}
