# T-044: Dockerfile API + прод-сборка фронта

**Фаза:** 5 · **Оценка:** 3ч · **Зависит от:** T-006 · **Статус:** todo

## Цель
API собирается в Docker-образ и работает локально; `vite build` даёт рабочую статику.

## Контекст
Dockerfile целиком — [08-infrastructure.md](../08-infrastructure.md#dockerfile-api).

## Что сделать
- [ ] `apps/api/Dockerfile` из 08-infrastructure.md; `.dockerignore` (node_modules, dist, .env)
- [ ] Прогнать локально: build + run с env локального Postgres (host.docker.internal)
- [ ] `pnpm --filter @orbital/web build` → `vite preview` — проверить все разделы на прод-сборке
- [ ] Починить всплывшее (обычно: env-переменные в build-time у Vite, пути, prisma generate в образе)

## Затрагиваемые файлы
- `apps/api/Dockerfile`, `.dockerignore` — создать

## Критерии приёмки
- [ ] `docker build -f apps/api/Dockerfile -t orbital-api .` успешен
- [ ] `docker run --env-file apps/api/.env -p 3000:3000 orbital-api` → /health отвечает, миграции применились при старте
- [ ] Прод-сборка фронта работает во всех разделах

## Как проверить
```bash
docker build -f apps/api/Dockerfile -t orbital-api .
docker run --rm --env-file apps/api/.env -e DATABASE_URL="postgresql://orbital:orbital@host.docker.internal:5432/orbital" -p 3000:3000 orbital-api
curl http://localhost:3000/api/v1/health
```

## Подводные камни
`pnpm deploy` требует настройки в монорепо (`shamefully-hoist` не нужен, но `--legacy` флаги
меняются между версиями pnpm) — при проблемах fallback: копировать workspace целиком и
`pnpm install --prod --filter @orbital/api`. Prisma в alpine: добавить `openssl`.
