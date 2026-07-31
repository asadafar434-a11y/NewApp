import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      NODE_ENV: "test",
      PORT: "3000",
      WEB_ORIGIN: "http://localhost:5173",
      // заведомо недоступный порт — проверяем ветку db:false без реальной БД
      DATABASE_URL: "postgresql://test:test@localhost:5499/test?connect_timeout=1",
    },
  },
});
