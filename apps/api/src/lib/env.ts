import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  // 8443, а не 5173 — реальный dev-порт apps/web (см. apps/web/vite.config.ts, Figma Make)
  WEB_ORIGIN: z.string().url().default("http://localhost:8443"),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000/api/v1/auth"),
  UNISENDER_GO_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  // MinIO локально (docker-compose), S3-совместимое хранилище в проде
  S3_ENDPOINT: z.string().url().default("http://localhost:9000"),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().default("orbital"),
  S3_SECRET_ACCESS_KEY: z.string().default("orbital-local"),
  S3_BUCKET: z.string().default("orbital-uploads"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Некорректные переменные окружения:", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
