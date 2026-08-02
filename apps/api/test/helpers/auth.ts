import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { prisma } from "./db.js";

const { app } = await import("../../src/app.js");

function signSessionToken(token: string) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET не задан");
  const signature = createHmac("sha256", secret).update(token).digest("base64");
  return `better-auth.session_token=${encodeURIComponent(`${token}.${signature}`)}`;
}

type SignUpOptions = { name?: string; email?: string; password?: string; company?: string };

async function signUp(options: SignUpOptions = {}) {
  const email = options.email ?? `test-${randomUUID()}@t.ru`;
  const name = options.name ?? "Тест Тестов";
  const password = options.password ?? "testpassword123";
  const company = options.company ?? "ООО Тест";

  const res = await app.request("/api/v1/auth/sign-up/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, company }),
  });
  const body = (await res.json()) as { user: { id: string } };
  return { userId: body.user.id, email, name, password, company };
}

/**
 * Регистрирует, подтверждает email напрямую в БД (в обход письма) и логинит.
 * Возвращает готовую куку сессии — переиспользуется во всех будущих тестах защищённых роутов.
 */
export async function registerAndLogin(options: SignUpOptions = {}) {
  const { userId, email, name, password } = await signUp(options);

  await prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });

  const signInRes = await app.request("/api/v1/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = signInRes.headers.get("set-cookie");
  if (!setCookie) {
    const debugBody = await signInRes.text();
    throw new Error(`sign-in не вернул Set-Cookie: status=${signInRes.status} body=${debugBody}`);
  }
  const cookie = setCookie.split(";")[0];

  const company = await prisma.company.findUniqueOrThrow({ where: { ownerId: userId } });

  return { cookie, userId, companyId: company.id, email, name };
}

/**
 * Сессия неподтверждённого пользователя — напрямую в БД, в обход sign-in (который
 * его блокирует ещё до выдачи сессии, см. docs/tasks/T-016-route-protection.md).
 */
export async function createUnverifiedSession(options: SignUpOptions = {}) {
  const { userId, email } = await signUp(options);

  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      id: randomBytes(16).toString("hex"),
      userId,
      token,
      expiresAt: new Date(Date.now() + 60_000),
    },
  });

  return { cookie: signSessionToken(token), userId, email };
}
