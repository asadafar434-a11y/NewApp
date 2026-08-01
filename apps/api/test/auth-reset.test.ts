import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";

// requestPasswordReset реально обращается к БД (ищет пользователя), поэтому в отличие от
// health.test.ts здесь нужен настоящий Postgres — та же orbital_test, что и в CI (ci.yml).
// Переопределяем DATABASE_URL до импорта app.js, чтобы PrismaClient подключился к ней
// (T-017 формализует эту инфраструктуру общим test/helpers/db.ts).
process.env.DATABASE_URL = "postgresql://orbital:orbital@localhost:5432/orbital_test";

const { app } = await import("../src/app.js");
const { prisma } = await import("../src/lib/prisma.js");

const EMAIL = "auth-reset-test@t.ru";

beforeEach(async () => {
  await prisma.user.deleteMany({ where: { email: EMAIL } });
});

describe("POST /api/v1/auth/request-password-reset", () => {
  it("возвращает одинаковый ответ для существующего и несуществующего email", async () => {
    await prisma.user.create({
      data: { id: randomUUID(), name: "Т", email: EMAIL, emailVerified: true },
    });

    const forExisting = await app.request("/api/v1/auth/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL }),
    });
    const forMissing = await app.request("/api/v1/auth/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "no-such-user-t014@t.ru" }),
    });

    expect(forExisting.status).toBe(forMissing.status);
    expect(await forExisting.json()).toEqual(await forMissing.json());
  });
});
