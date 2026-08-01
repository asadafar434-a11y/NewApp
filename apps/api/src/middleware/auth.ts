import type { Context, Next } from "hono";
import { ERROR_CODES } from "@orbital/shared";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "./error-handler.js";

export type AuthContext = {
  userId: string;
  companyId: string;
  role: string;
};

declare module "hono" {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

/**
 * Первый «настоящий» защищённый middleware (T-016, см. docs/07-auth-and-security.md —
 * «Матрица прав»). Кладёт ctx = {userId, companyId, role} в контекст запроса — все
 * последующие защищённые роуты навешивают его и читают через `c.get('auth')`.
 * Нет сессии -> 401; email не подтверждён -> 403; компания soft-deleted -> 403.
 */
export async function requireAuth(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw new ApiError(401, ERROR_CODES.UNAUTHORIZED, "Требуется вход");
  }
  if (!session.user.emailVerified) {
    throw new ApiError(403, ERROR_CODES.EMAIL_NOT_VERIFIED, "Подтвердите email, чтобы продолжить");
  }

  const company = await prisma.company.findUnique({ where: { ownerId: session.user.id } });
  if (!company || company.deletedAt) {
    throw new ApiError(403, ERROR_CODES.FORBIDDEN, "Компания недоступна");
  }

  const role = (session.user as { role?: string }).role ?? "owner";
  c.set("auth", { userId: session.user.id, companyId: company.id, role });

  return next();
}
