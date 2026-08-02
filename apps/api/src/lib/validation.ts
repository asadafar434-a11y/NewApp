import type { Context } from "hono";
import type { ZodError } from "zod";
import { ERROR_CODES } from "@orbital/shared";

/** Общий hook для zValidator — приводит ошибку Zod к единому формату ошибок API (docs/05-api.md). */
export function zodErrorHook(
  result: { success: true } | { success: false; error: ZodError },
  c: Context,
) {
  if (!result.success) {
    const details = result.error.flatten().fieldErrors;
    return c.json(
      { error: { code: ERROR_CODES.VALIDATION, message: "Некорректные данные", details } },
      400,
    );
  }
}
