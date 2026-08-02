const { app } = await import("../../src/app.js");

/** app.request() с кукой сессии — переиспользуется во всех CRUD-тестах (см. requests.test.ts, где паттерн появился впервые). */
export function authedRequest(path: string, cookie: string, init: RequestInit = {}) {
  return app.request(path, {
    ...init,
    headers: { "Content-Type": "application/json", Cookie: cookie, ...init.headers },
  });
}
