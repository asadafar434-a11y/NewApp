import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { prisma, truncateAll } from "./helpers/db.js";

const { app } = await import("../src/app.js");

const EMAIL = "auth-reset-test@t.ru";

beforeEach(async () => {
  await truncateAll();
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
