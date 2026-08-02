import { beforeEach, describe, expect, it } from "vitest";
import { prisma, truncateAll } from "./helpers/db.js";
import { registerAndLogin } from "./helpers/auth.js";
import { authedRequest } from "./helpers/http.js";

beforeEach(async () => {
  await truncateAll();
});

async function createSpecialistWithConversation(
  cookie: string,
  overrides: Record<string, unknown> = {},
) {
  const requestRes = await authedRequest("/api/v1/requests", cookie, {
    method: "POST",
    body: JSON.stringify({
      type: "hire",
      title: "Тест",
      description: "Описание тестовой заявки для проверки чата.",
      priceKopecks: null,
    }),
  });
  const request = await requestRes.json();

  const specialistRes = await authedRequest("/api/v1/specialists", cookie, {
    method: "POST",
    body: JSON.stringify({
      requestId: request.id,
      name: "Анна Ковалёва",
      role: "UX Designer",
      email: "anna@example.com",
      ...overrides,
    }),
  });
  const specialist = await specialistRes.json();

  const conversation = await prisma.conversation.findUniqueOrThrow({
    where: { specialistId: specialist.id },
  });

  return { specialist, conversationId: conversation.id };
}

describe("GET /api/v1/conversations", () => {
  it("изоляция компаний — чужие диалоги не видны", async () => {
    const owner = await registerAndLogin({ company: "Компания владельца" });
    const stranger = await registerAndLogin({ company: "Компания чужака" });
    await createSpecialistWithConversation(owner.cookie);

    const res = await authedRequest("/api/v1/conversations", stranger.cookie);
    const body = await res.json();
    expect(body.items).toHaveLength(0);
  });

  it("после soft-delete специалиста диалог пропадает из списка", async () => {
    const { cookie } = await registerAndLogin();
    const { specialist, conversationId } = await createSpecialistWithConversation(cookie);

    const beforeDelete = await (await authedRequest("/api/v1/conversations", cookie)).json();
    expect(beforeDelete.items).toHaveLength(1);

    await authedRequest(`/api/v1/specialists/${specialist.id}`, cookie, { method: "DELETE" });

    const afterDelete = await (await authedRequest("/api/v1/conversations", cookie)).json();
    expect(afterDelete.items).toHaveLength(0);

    const messagesRes = await authedRequest(
      `/api/v1/conversations/${conversationId}/messages`,
      cookie,
    );
    expect(messagesRes.status).toBe(404);
  });

  it("после создания специалиста появляется диалог без сообщений", async () => {
    const { cookie } = await registerAndLogin();
    const { specialist } = await createSpecialistWithConversation(cookie);

    const res = await authedRequest("/api/v1/conversations", cookie);
    const body = await res.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      specialistId: specialist.id,
      specialistName: "Анна Ковалёва",
      specialistRole: "UX Designer",
      lastMessage: null,
      unreadCount: 0,
    });
  });

  it("unread-счётчик растёт от входящих сообщений специалиста и сбрасывается через /read", async () => {
    const { cookie } = await registerAndLogin();
    const { conversationId } = await createSpecialistWithConversation(cookie);

    // Публичного chat-эндпоинта для специалиста пока нет (появится в T-025) —
    // входящее сообщение имитируем напрямую в БД.
    await prisma.message.create({
      data: { conversationId, sender: "specialist", text: "Добрый день!", status: "sent" },
    });

    const afterIncoming = await (await authedRequest("/api/v1/conversations", cookie)).json();
    expect(afterIncoming.items[0].unreadCount).toBe(1);
    expect(afterIncoming.items[0].lastMessage).toMatchObject({
      sender: "specialist",
      text: "Добрый день!",
    });

    const readRes = await authedRequest(`/api/v1/conversations/${conversationId}/read`, cookie, {
      method: "POST",
    });
    expect(readRes.status).toBe(204);

    const afterRead = await (await authedRequest("/api/v1/conversations", cookie)).json();
    expect(afterRead.items[0].unreadCount).toBe(0);
  });

  it("чужой диалог — 404 на messages/read", async () => {
    const owner = await registerAndLogin({ company: "Компания владельца" });
    const stranger = await registerAndLogin({ company: "Компания чужака" });
    const { conversationId } = await createSpecialistWithConversation(owner.cookie);

    const messagesRes = await authedRequest(
      `/api/v1/conversations/${conversationId}/messages`,
      stranger.cookie,
    );
    expect(messagesRes.status).toBe(404);

    const sendRes = await authedRequest(
      `/api/v1/conversations/${conversationId}/messages`,
      stranger.cookie,
      { method: "POST", body: JSON.stringify({ text: "Привет" }) },
    );
    expect(sendRes.status).toBe(404);

    const readRes = await authedRequest(
      `/api/v1/conversations/${conversationId}/read`,
      stranger.cookie,
      {
        method: "POST",
      },
    );
    expect(readRes.status).toBe(404);
  });
});

describe("POST /api/v1/conversations/:id/messages", () => {
  it("создаёт сообщение от owner со статусом sent", async () => {
    const { cookie } = await registerAndLogin();
    const { conversationId } = await createSpecialistWithConversation(cookie);

    const res = await authedRequest(`/api/v1/conversations/${conversationId}/messages`, cookie, {
      method: "POST",
      body: JSON.stringify({ text: "Добрый день, расскажите о позиции" }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      sender: "owner",
      text: "Добрый день, расскажите о позиции",
      status: "sent",
    });
  });

  it("пустой текст — 400 VALIDATION", async () => {
    const { cookie } = await registerAndLogin();
    const { conversationId } = await createSpecialistWithConversation(cookie);

    const res = await authedRequest(`/api/v1/conversations/${conversationId}/messages`, cookie, {
      method: "POST",
      body: JSON.stringify({ text: "" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION");
  });
});

describe("GET /api/v1/conversations/:id/messages", () => {
  it("порядок — от новых к старым, с корректной пагинацией", async () => {
    const { cookie } = await registerAndLogin();
    const { conversationId } = await createSpecialistWithConversation(cookie);

    const base = new Date("2026-08-01T10:00:00.000Z").getTime();
    for (let i = 0; i < 3; i++) {
      await prisma.message.create({
        data: {
          conversationId,
          sender: i % 2 === 0 ? "owner" : "specialist",
          text: `Сообщение ${i}`,
          status: "sent",
          createdAt: new Date(base + i * 60_000),
        },
      });
    }

    const firstPage = await (
      await authedRequest(`/api/v1/conversations/${conversationId}/messages?limit=2`, cookie)
    ).json();
    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.items[0].text).toBe("Сообщение 2");
    expect(firstPage.items[1].text).toBe("Сообщение 1");
    expect(firstPage.nextCursor).not.toBeNull();

    const secondPage = await (
      await authedRequest(
        `/api/v1/conversations/${conversationId}/messages?limit=2&cursor=${firstPage.nextCursor}`,
        cookie,
      )
    ).json();
    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.items[0].text).toBe("Сообщение 0");
    expect(secondPage.nextCursor).toBeNull();
  });
});
