import { beforeEach, describe, expect, it } from "vitest";
import { truncateAll } from "./helpers/db.js";
import { registerAndLogin } from "./helpers/auth.js";
import { authedRequest } from "./helpers/http.js";

beforeEach(async () => {
  await truncateAll();
});

describe("POST /api/v1/requests", () => {
  it("создаёт hire-заявку без цены", async () => {
    const { cookie } = await registerAndLogin();

    const res = await authedRequest("/api/v1/requests", cookie, {
      method: "POST",
      body: JSON.stringify({
        type: "hire",
        title: "Продуктовый дизайнер",
        description: "Ищем сильного продуктового дизайнера в команду.",
        priceKopecks: null,
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      type: "hire",
      title: "Продуктовый дизайнер",
      priceKopecks: null,
      status: "open",
      specialistCount: 0,
    });
  });

  it("consult без цены — 400 VALIDATION", async () => {
    const { cookie } = await registerAndLogin();

    const res = await authedRequest("/api/v1/requests", cookie, {
      method: "POST",
      body: JSON.stringify({
        type: "consult",
        title: "Консультация по налогам",
        description: "Нужна консультация по оптимизации налогообложения.",
        priceKopecks: null,
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION");
  });

  it("consult с ценой — 201", async () => {
    const { cookie } = await registerAndLogin();

    const res = await authedRequest("/api/v1/requests", cookie, {
      method: "POST",
      body: JSON.stringify({
        type: "consult",
        title: "Консультация по налогам",
        description: "Нужна консультация по оптимизации налогообложения.",
        priceKopecks: 500_000,
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.priceKopecks).toBe(500_000);
  });
});

describe("изоляция компаний", () => {
  it("чужая заявка недоступна — 404", async () => {
    const owner = await registerAndLogin({ company: "Компания владельца" });
    const stranger = await registerAndLogin({ company: "Компания чужака" });

    const createRes = await authedRequest("/api/v1/requests", owner.cookie, {
      method: "POST",
      body: JSON.stringify({
        type: "hire",
        title: "Секретная вакансия",
        description: "Видна только владельцу компании.",
        priceKopecks: null,
      }),
    });
    const created = await createRes.json();

    const res = await authedRequest(`/api/v1/requests/${created.id}`, stranger.cookie);
    expect(res.status).toBe(404);
  });

  it("список заявок не содержит чужие", async () => {
    const owner = await registerAndLogin();
    const stranger = await registerAndLogin();

    await authedRequest("/api/v1/requests", owner.cookie, {
      method: "POST",
      body: JSON.stringify({
        type: "hire",
        title: "Заявка владельца",
        description: "Не должна быть видна чужаку.",
        priceKopecks: null,
      }),
    });

    const res = await authedRequest("/api/v1/requests", stranger.cookie);
    const body = await res.json();
    expect(body.items).toHaveLength(0);
  });
});

describe("DELETE /api/v1/requests/:id", () => {
  it("soft-delete скрывает заявку из списка", async () => {
    const { cookie } = await registerAndLogin();

    const createRes = await authedRequest("/api/v1/requests", cookie, {
      method: "POST",
      body: JSON.stringify({
        type: "hire",
        title: "Временная заявка",
        description: "Будет удалена в этом тесте.",
        priceKopecks: null,
      }),
    });
    const created = await createRes.json();

    const deleteRes = await authedRequest(`/api/v1/requests/${created.id}`, cookie, {
      method: "DELETE",
    });
    expect(deleteRes.status).toBe(204);

    const listRes = await authedRequest("/api/v1/requests", cookie);
    const body = await listRes.json();
    expect(body.items).toHaveLength(0);

    const getRes = await authedRequest(`/api/v1/requests/${created.id}`, cookie);
    expect(getRes.status).toBe(404);
  });
});
