import { errorResponseSchema, type ErrorResponse } from "@orbital/shared";

/**
 * Разбор тела ошибки API в единый формат (docs/05-api.md).
 * Полноценный fetch-клиент появится в T-015.
 */
export function parseApiError(body: unknown): ErrorResponse["error"] | null {
  const parsed = errorResponseSchema.safeParse(body);
  return parsed.success ? parsed.data.error : null;
}
