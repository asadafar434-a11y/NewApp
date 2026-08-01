/**
 * Реальный Postgres для интеграционных тестов (в отличие от health.test.ts, который
 * намеренно бьёт в недоступный порт из vitest.config). Та же orbital_test, что и в CI
 * (ci.yml) — см. docs/tasks/T-014-password-reset.md, где паттерн появился впервые.
 * DATABASE_URL переопределяется здесь, ДО динамического импорта prisma.js, чтобы
 * PrismaClient подключился именно к этой БД, а не к глобальной из vitest.config.
 */
process.env.DATABASE_URL = "postgresql://orbital:orbital@localhost:5432/orbital_test";

const { prisma } = await import("../../src/lib/prisma.js");

export { prisma };

/** Очищает все таблицы public-схемы (кроме служебной _prisma_migrations). */
export async function truncateAll() {
  const rows = await prisma.$queryRaw<
    { tablename: string }[]
  >`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;

  if (rows.length === 0) return;

  const names = rows.map((r) => `"${r.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`);
}
