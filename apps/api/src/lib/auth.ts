import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendEmail } from "./email/index.js";
import { env } from "./env.js";
import { prisma } from "./prisma.js";

/**
 * Company создаётся после регистрации из поля company (additionalFields), которое сама
 * User-таблица не хранит — before-хук вырезает поле перед записью, after-хук читает его
 * из этой карты (см. docs/07-auth-and-security.md).
 * Ключ — email, а не id: в before-хуке better-auth ещё не сгенерировал id пользователя
 * (он присваивается внутри адаптера непосредственно перед записью в БД), а email уже
 * нормализован (lowercase) и одинаков в before и after.
 */
const pendingCompanyNames = new Map<string, string>();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.WEB_ORIGIN],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail("reset", user.email, { url, name: user.name });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail("verify", user.email, { url, name: user.name });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 дней
    updateAge: 60 * 60 * 24, // скользящее продление раз в сутки
    cookieCache: { enabled: true, maxAge: 300 }, // не ходить в БД за сессией на каждый запрос
  },
  advanced: { useSecureCookies: env.NODE_ENV === "production" },
  user: {
    additionalFields: {
      company: { type: "string", required: true, input: true, returned: false },
      // реальная колонка User.role (T-008) — просто делаем её видимой в session.user
      role: { type: "string", required: false, input: false, defaultValue: "owner" },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const { company } = user as typeof user & { company: string };
          pendingCompanyNames.set(user.email, company);
          // better-auth мержит result.data поверх исходного объекта ({...actualData, ...result.data}),
          // а не заменяет его целиком — пропуск ключа его не удалит, нужно явно undefined
          return { data: { company: undefined } };
        },
        after: async (user) => {
          const companyName = pendingCompanyNames.get(user.email);
          pendingCompanyNames.delete(user.email);
          if (companyName) {
            await prisma.company.create({ data: { ownerId: user.id, name: companyName } });
          }
        },
      },
    },
  },
});
