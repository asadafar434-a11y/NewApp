import { beforeEach, describe, expect, it } from "vitest";
import { prisma, truncateAll } from "./helpers/db.js";
import { createUnverifiedSession, registerAndLogin } from "./helpers/auth.js";

const { app } = await import("../src/app.js");

beforeEach(async () => {
  await truncateAll();
});

describe("регистрация", () => {
  it("создаёт Company вместе с User", async () => {
    const { userId, companyId } = await registerAndLogin({ company: "ООО Ромашка" });

    const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
    expect(company.ownerId).toBe(userId);
    expect(company.name).toBe("ООО Ромашка");
  });
});

describe("вход", () => {
  it("возвращает сессионную куку", async () => {
    const { cookie } = await registerAndLogin();
    expect(cookie).toMatch(/^better-auth\.session_token=/);
  });
});

describe("GET /api/v1/me", () => {
  it("без куки — 401", async () => {
    const res = await app.request("/api/v1/me");
    expect(res.status).toBe(401);
  });

  it("до подтверждения email — 403 EMAIL_NOT_VERIFIED", async () => {
    const { cookie } = await createUnverifiedSession();

    const res = await app.request("/api/v1/me", { headers: { Cookie: cookie } });
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.error.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("после подтверждения — 200 с user и company", async () => {
    const { cookie, companyId } = await registerAndLogin({
      name: "Иван Иванов",
      company: "ООО Тест2",
    });

    const res = await app.request("/api/v1/me", { headers: { Cookie: cookie } });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.user.name).toBe("Иван Иванов");
    expect(body.user.role).toBe("owner");
    expect(body.company.id).toBe(companyId);
  });
});

describe("изоляция компаний (заготовка, расширится в T-018+)", () => {
  it("/me для двух пользователей возвращает их собственные, разные компании", async () => {
    const a = await registerAndLogin({ company: "Компания A" });
    const b = await registerAndLogin({ company: "Компания B" });

    const resA = await app.request("/api/v1/me", { headers: { Cookie: a.cookie } });
    const resB = await app.request("/api/v1/me", { headers: { Cookie: b.cookie } });

    const bodyA = await resA.json();
    const bodyB = await resB.json();

    expect(bodyA.company.id).toBe(a.companyId);
    expect(bodyB.company.id).toBe(b.companyId);
    expect(bodyA.company.id).not.toBe(bodyB.company.id);
  });
});
