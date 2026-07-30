# T-007: Prisma — инициализация и подключение

**Фаза:** 1 · **Оценка:** 2ч · **Зависит от:** T-003, T-004 · **Статус:** todo

## Цель
Prisma подключён к локальному Postgres; /health проверяет БД (`db: true`); CI гоняет миграции.

## Что сделать
- [ ] deps api: `prisma` (dev), `@prisma/client`; `npx prisma init` в apps/api
- [ ] `prisma/schema.prisma`: generator + datasource (env DATABASE_URL); моделей пока нет
- [ ] `src/lib/prisma.ts`: singleton PrismaClient
- [ ] /health: `SELECT 1` через prisma, поле `db: boolean` (при недоступной БД — `db:false`, статус всё равно 200)
- [ ] Раскомментировать prisma-шаги в ci.yml (см. T-006, [08-infrastructure.md](../08-infrastructure.md))
- [ ] `.env` в apps/api (в .gitignore), DATABASE_URL локального Postgres

## Затрагиваемые файлы
- `apps/api/prisma/schema.prisma`, `apps/api/src/lib/prisma.ts` — создать
- `apps/api/src/routes/health.routes.ts`, `.github/workflows/ci.yml` — изменить

## Критерии приёмки
- [ ] `npx prisma migrate dev --name init` проходит (пустая миграция допустима)
- [ ] `curl .../health` → `{"status":"ok","db":true}`; при остановленном Postgres → `db:false`
- [ ] CI зелёный с сервисом postgres

## Как проверить
```bash
docker compose up -d postgres
pnpm --filter @orbital/api exec prisma migrate dev
curl http://localhost:3000/api/v1/health
```

## Подводные камни
`prisma generate` должен запускаться после install (postinstall-скрипт api). В тестах health
без БД — мокнуть prisma или поднять тестовую БД (пока проще проверить только ветку db:false).
