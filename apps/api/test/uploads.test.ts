import { beforeEach, describe, expect, it } from "vitest";
import { truncateAll } from "./helpers/db.js";
import { registerAndLogin } from "./helpers/auth.js";
import { authedRequest } from "./helpers/http.js";

beforeEach(async () => {
  await truncateAll();
});

describe("POST /api/v1/uploads/presign", () => {
  it("генерирует ключ с префиксом companies/{companyId}/ из авторизованного контекста", async () => {
    const owner = await registerAndLogin({ company: "Компания владельца" });
    const stranger = await registerAndLogin({ company: "Компания чужака" });

    const ownerRes = await authedRequest("/api/v1/uploads/presign", owner.cookie, {
      method: "POST",
      body: JSON.stringify({ kind: "avatar", contentType: "image/png", sizeBytes: 1024 }),
    });
    const strangerRes = await authedRequest("/api/v1/uploads/presign", stranger.cookie, {
      method: "POST",
      body: JSON.stringify({ kind: "avatar", contentType: "image/png", sizeBytes: 1024 }),
    });

    expect(ownerRes.status).toBe(200);
    expect(strangerRes.status).toBe(200);
    const ownerBody = await ownerRes.json();
    const strangerBody = await strangerRes.json();

    expect(ownerBody.key).toMatch(new RegExp(`^companies/${owner.companyId}/avatar/`));
    expect(strangerBody.key).toMatch(new RegExp(`^companies/${stranger.companyId}/avatar/`));
    expect(ownerBody.key).not.toContain(stranger.companyId);
    expect(strangerBody.key).not.toContain(owner.companyId);
    expect(typeof ownerBody.url).toBe("string");
  });

  it("резюме не-PDF → 400 VALIDATION", async () => {
    const { cookie } = await registerAndLogin();

    const res = await authedRequest("/api/v1/uploads/presign", cookie, {
      method: "POST",
      body: JSON.stringify({ kind: "resume", contentType: "image/png", sizeBytes: 1024 }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION");
  });

  it("аватар не image/* → 400 VALIDATION", async () => {
    const { cookie } = await registerAndLogin();

    const res = await authedRequest("/api/v1/uploads/presign", cookie, {
      method: "POST",
      body: JSON.stringify({ kind: "avatar", contentType: "application/pdf", sizeBytes: 1024 }),
    });

    expect(res.status).toBe(400);
  });

  it("больше 10 МБ → 400 VALIDATION", async () => {
    const { cookie } = await registerAndLogin();

    const res = await authedRequest("/api/v1/uploads/presign", cookie, {
      method: "POST",
      body: JSON.stringify({
        kind: "avatar",
        contentType: "image/png",
        sizeBytes: 11 * 1024 * 1024,
      }),
    });

    expect(res.status).toBe(400);
  });

  it("реальная загрузка в MinIO: PUT по presigned URL, затем скачивание", async () => {
    const { cookie } = await registerAndLogin();
    const content = "%PDF-1.4 тестовое резюме";
    const bytes = Buffer.byteLength(content, "utf-8");

    const presignRes = await authedRequest("/api/v1/uploads/presign", cookie, {
      method: "POST",
      body: JSON.stringify({ kind: "resume", contentType: "application/pdf", sizeBytes: bytes }),
    });
    expect(presignRes.status).toBe(200);
    const { url, key } = await presignRes.json();

    const putRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf", "Content-Length": String(bytes) },
      body: content,
    });
    expect(putRes.status).toBe(200);

    const specialistRes = await authedRequest("/api/v1/specialists", cookie, {
      method: "POST",
      body: JSON.stringify({
        requestId: (
          await (
            await authedRequest("/api/v1/requests", cookie, {
              method: "POST",
              body: JSON.stringify({
                type: "hire",
                title: "Тест",
                description: "Описание тестовой заявки для проверки загрузки.",
                priceKopecks: null,
              }),
            })
          ).json()
        ).id,
        name: "Тест Файлов",
        role: "QA",
        email: "files-test@example.com",
        resumeKey: key,
      }),
    });
    const specialist = await specialistRes.json();
    expect(specialist.resumeKey).toBe(key);

    const fileRes = await authedRequest(
      `/api/v1/specialists/${specialist.id}/files/resume`,
      cookie,
      { redirect: "manual" },
    );
    expect(fileRes.status).toBe(302);
    const downloadUrl = fileRes.headers.get("location")!;
    expect(downloadUrl).toContain(key);

    const downloadRes = await fetch(downloadUrl);
    expect(downloadRes.status).toBe(200);
    expect(await downloadRes.text()).toBe(content);
  });
});

describe("GET /api/v1/specialists/:id/files/:kind", () => {
  async function createSpecialist(cookie: string, overrides: Record<string, unknown> = {}) {
    const requestRes = await authedRequest("/api/v1/requests", cookie, {
      method: "POST",
      body: JSON.stringify({
        type: "hire",
        title: "Тест",
        description: "Описание тестовой заявки для проверки файлов.",
        priceKopecks: null,
      }),
    });
    const request = await requestRes.json();
    const res = await authedRequest("/api/v1/specialists", cookie, {
      method: "POST",
      body: JSON.stringify({
        requestId: request.id,
        name: "Тест",
        role: "QA",
        email: "qa@example.com",
        ...overrides,
      }),
    });
    return res.json();
  }

  it("файл не загружен — 404", async () => {
    const { cookie } = await registerAndLogin();
    const specialist = await createSpecialist(cookie);

    const res = await authedRequest(`/api/v1/specialists/${specialist.id}/files/resume`, cookie, {
      redirect: "manual",
    });
    expect(res.status).toBe(404);
  });

  it("чужой специалист — 404", async () => {
    const owner = await registerAndLogin({ company: "Компания владельца" });
    const stranger = await registerAndLogin({ company: "Компания чужака" });
    const specialist = await createSpecialist(owner.cookie, {
      resumeKey: "companies/x/resume/y.pdf",
    });

    const res = await authedRequest(
      `/api/v1/specialists/${specialist.id}/files/resume`,
      stranger.cookie,
      { redirect: "manual" },
    );
    expect(res.status).toBe(404);
  });
});
