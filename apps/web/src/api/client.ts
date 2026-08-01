import { errorResponseSchema, type ErrorResponse } from "@orbital/shared";

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

/** Разбор тела ошибки API в единый формат (docs/05-api.md). */
export function parseApiError(body: unknown): ErrorResponse["error"] | null {
  const parsed = errorResponseSchema.safeParse(body);
  return parsed.success ? parsed.data.error : null;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Fetch-обёртка для бизнес-эндпоинтов (не auth — тот идёт через lib/authClient).
 * credentials:'include' — та же кука сессии; 401 (кроме /me) уводит на /auth.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (res.status === 401) {
    window.location.href = "/auth";
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const error = parseApiError(body);
    throw new ApiClientError(
      res.status,
      error?.code ?? "UNKNOWN",
      error?.message ?? "Ошибка запроса",
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
