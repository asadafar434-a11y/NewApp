import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Несколько тестовых файлов бьют в одну и ту же orbital_test с truncateAll() в
    // beforeEach (test/helpers/db.ts) — при параллельных файлах один может стереть данные
    // другого посреди теста. Файлы идут последовательно; тесты внутри файла — как обычно.
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      PORT: "3000",
      WEB_ORIGIN: "http://localhost:5173",
      // заведомо недоступный порт — проверяем ветку db:false без реальной БД
      DATABASE_URL: "postgresql://test:test@localhost:5499/test?connect_timeout=1",
      BETTER_AUTH_SECRET: "test-secret-at-least-32-characters-long",
      BETTER_AUTH_URL: "http://localhost:3000/api/v1/auth",
    },
  },
});
