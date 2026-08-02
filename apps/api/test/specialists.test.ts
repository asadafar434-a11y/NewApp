import { beforeEach, describe, expect, it } from "vitest";
import { prisma, truncateAll } from "./helpers/db.js";
import { registerAndLogin } from "./helpers/auth.js";
import { authedRequest } from "./helpers/http.js";

beforeEach(async () => {
  await truncateAll();
});

async function createRequest(cookie: string, overrides: Record<string, unknown> = {}) {
  const res = await authedRequest("/api/v1/requests", cookie, {
    method: "POST",
    body: JSON.stringify({
      type: "hire",
      title: "Продуктовый дизайнер",
      description: "Ищем сильного продуктового дизайнера в команду.",
      priceKopecks: null,
      ...overrides,
    }),
  });
  return res.json();
}

function specialistPayload(requestId: string, overrides: Record<string, unknown> = {}) {
  return {
    requestId,
    name: "Анна Ковалёва",
    role: "Senior UX Designer",
    email: "anna@example.com",
    ...overrides,
  };
}

describe("POST /api/v1/specialists", () => {
  it("создаёт специалиста вместе с Conversation", async () => {
    const { cookie } = await registerAndLogin();
    const request = await createRequest(cookie);

    const res = await authedRequest("/api/v1/specialists", cookie, {
      method: "POST",
      body: JSON.stringify(specialistPayload(request.id)),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      requestId: request.id,
      name: "Анна Ковалёва",
      role: "Senior UX Designer",
      email: "anna@example.com",
      status: "new",
      matchScore: null,
      statusChanges: [],
      calls: [],
    });

    const conversation = await prisma.conversation.findUnique({
      where: { specialistId: body.id },
    });
    expect(conversation).not.toBeNull();
  });

  it("без email — 400 VALIDATION", async () => {
    const { cookie } = await registerAndLogin();
    const request = await createRequest(cookie);

    const payload = specialistPayload(request.id) as Record<string, unknown>;
    delete payload.email;

    const res = await authedRequest("/api/v1/specialists", cookie, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION");
  });

  it("чужой requestId — 404", async () => {
    const owner = await registerAndLogin({ company: "Компания владельца" });
    const stranger = await registerAndLogin({ company: "Компания чужака" });
    const foreignRequest = await createRequest(stranger.cookie);

    const res = await authedRequest("/api/v1/specialists", owner.cookie, {
      method: "POST",
      body: JSON.stringify(specialistPayload(foreignRequest.id)),
    });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/v1/specialists", () => {
  it("поиск по имени и роли", async () => {
    const { cookie } = await registerAndLogin();
    const request = await createRequest(cookie);

    await authedRequest("/api/v1/specialists", cookie, {
      method: "POST",
      body: JSON.stringify(
        specialistPayload(request.id, { name: "Анна Ковалёва", role: "UX Designer" }),
      ),
    });
    await authedRequest("/api/v1/specialists", cookie, {
      method: "POST",
      body: JSON.stringify(
        specialistPayload(request.id, {
          name: "Дмитрий Орлов",
          role: "Backend Engineer",
          email: "dmitry@example.com",
        }),
      ),
    });

    const byName = await authedRequest("/api/v1/specialists?search=ковал", cookie);
    const byNameBody = await byName.json();
    expect(byNameBody.items).toHaveLength(1);
    expect(byNameBody.items[0].name).toBe("Анна Ковалёва");

    const byRole = await authedRequest("/api/v1/specialists?search=backend", cookie);
    const byRoleBody = await byRole.json();
    expect(byRoleBody.items).toHaveLength(1);
    expect(byRoleBody.items[0].role).toBe("Backend Engineer");
  });

  it("пагинация через cursor", async () => {
    const { cookie } = await registerAndLogin();
    const request = await createRequest(cookie);

    for (let i = 0; i < 3; i++) {
      await authedRequest("/api/v1/specialists", cookie, {
        method: "POST",
        body: JSON.stringify(
          specialistPayload(request.id, { name: `Кандидат ${i}`, email: `c${i}@example.com` }),
        ),
      });
    }

    const firstPage = await authedRequest("/api/v1/specialists?limit=2", cookie);
    const firstBody = await firstPage.json();
    expect(firstBody.items).toHaveLength(2);
    expect(firstBody.nextCursor).not.toBeNull();

    const secondPage = await authedRequest(
      `/api/v1/specialists?limit=2&cursor=${firstBody.nextCursor}`,
      cookie,
    );
    const secondBody = await secondPage.json();
    expect(secondBody.items).toHaveLength(1);
    expect(secondBody.nextCursor).toBeNull();

    const allIds = new Set(
      [...firstBody.items, ...secondBody.items].map((s: { id: string }) => s.id),
    );
    expect(allIds.size).toBe(3);
  });

  it("изоляция компаний — чужие специалисты не видны", async () => {
    const owner = await registerAndLogin();
    const stranger = await registerAndLogin();
    const request = await createRequest(owner.cookie);
    await authedRequest("/api/v1/specialists", owner.cookie, {
      method: "POST",
      body: JSON.stringify(specialistPayload(request.id)),
    });

    const res = await authedRequest("/api/v1/specialists", stranger.cookie);
    const body = await res.json();
    expect(body.items).toHaveLength(0);
  });
});

describe("POST /api/v1/specialists/:id/status", () => {
  async function changeStatus(cookie: string, id: string, status: string) {
    return authedRequest(`/api/v1/specialists/${id}/status`, cookie, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  }

  it("hire-цепочка: new → contacted → scheduled → interviewed → hired", async () => {
    const { cookie } = await registerAndLogin();
    const request = await createRequest(cookie, { type: "hire" });
    const createRes = await authedRequest("/api/v1/specialists", cookie, {
      method: "POST",
      body: JSON.stringify(specialistPayload(request.id)),
    });
    const specialist = await createRes.json();

    for (const status of ["contacted", "scheduled", "interviewed", "hired"]) {
      const res = await changeStatus(cookie, specialist.id, status);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe(status);
    }

    const detail = await (
      await authedRequest(`/api/v1/specialists/${specialist.id}`, cookie)
    ).json();
    expect(detail.statusChanges).toHaveLength(4);
    expect(detail.statusChanges[0]).toMatchObject({ fromStatus: "new", toStatus: "contacted" });
    expect(detail.statusChanges[3]).toMatchObject({ fromStatus: "interviewed", toStatus: "hired" });
  });

  it("consult-цепочка: new → contacted → consult_scheduled → consult_done", async () => {
    const { cookie } = await registerAndLogin();
    const request = await createRequest(cookie, {
      type: "consult",
      priceKopecks: 500_000,
    });
    const createRes = await authedRequest("/api/v1/specialists", cookie, {
      method: "POST",
      body: JSON.stringify(specialistPayload(request.id)),
    });
    const specialist = await createRes.json();

    for (const status of ["contacted", "consult_scheduled", "consult_done"]) {
      const res = await changeStatus(cookie, specialist.id, status);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe(status);
    }
  });

  it("rejected достижим из contacted в обоих циклах", async () => {
    const { cookie } = await registerAndLogin();
    const request = await createRequest(cookie, { type: "hire" });
    const createRes = await authedRequest("/api/v1/specialists", cookie, {
      method: "POST",
      body: JSON.stringify(specialistPayload(request.id)),
    });
    const specialist = await createRes.json();

    await changeStatus(cookie, specialist.id, "contacted");
    const res = await changeStatus(cookie, specialist.id, "rejected");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("rejected");
  });

  it("недопустимый переход (new → hired) — 400 VALIDATION", async () => {
    const { cookie } = await registerAndLogin();
    const request = await createRequest(cookie, { type: "hire" });
    const createRes = await authedRequest("/api/v1/specialists", cookie, {
      method: "POST",
      body: JSON.stringify(specialistPayload(request.id)),
    });
    const specialist = await createRes.json();

    const res = await changeStatus(cookie, specialist.id, "hired");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION");
  });

  it("consult-статус недопустим для hire-специалиста — 400", async () => {
    const { cookie } = await registerAndLogin();
    const request = await createRequest(cookie, { type: "hire" });
    const createRes = await authedRequest("/api/v1/specialists", cookie, {
      method: "POST",
      body: JSON.stringify(specialistPayload(request.id)),
    });
    const specialist = await createRes.json();
    await changeStatus(cookie, specialist.id, "contacted");

    const res = await changeStatus(cookie, specialist.id, "consult_scheduled");
    expect(res.status).toBe(400);
  });

  it("чужой специалист — 404", async () => {
    const owner = await registerAndLogin({ company: "Компания владельца" });
    const stranger = await registerAndLogin({ company: "Компания чужака" });
    const request = await createRequest(owner.cookie, { type: "hire" });
    const createRes = await authedRequest("/api/v1/specialists", owner.cookie, {
      method: "POST",
      body: JSON.stringify(specialistPayload(request.id)),
    });
    const specialist = await createRes.json();

    const res = await changeStatus(stranger.cookie, specialist.id, "contacted");
    expect(res.status).toBe(404);
  });
});
