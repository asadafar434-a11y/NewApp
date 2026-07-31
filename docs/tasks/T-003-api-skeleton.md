# T-003: apps/api — скелет Hono с /health

**Фаза:** 0 · **Оценка:** 3ч · **Зависит от:** T-002 · **Статус:** done

## Цель
`GET http://localhost:3000/api/v1/health` возвращает `{"status":"ok"}`; логи пишутся Pino.

## Контекст
Слои и структура: [03-architecture.md](../03-architecture.md#слои-бэкенда-и-правила-зависимостей).
БД пока не подключаем (поле `db` в health добавится в T-007).

## Что сделать
- [ ] `apps/api/package.json`: name `@orbital/api`; deps: `hono`, `@hono/node-server`, `pino`, `zod`, `@orbital/shared`; devDeps: `tsx`, `typescript`; скрипты `dev: tsx watch src/index.ts`, `build: tsc`, `start: node dist/index.js`
- [ ] `src/index.ts`: создание Hono-приложения, `serve()` на PORT из env
- [ ] `src/app.ts`: базовый app, префикс `/api/v1`, `secureHeaders()`, CORS на WEB_ORIGIN
- [ ] `src/routes/health.routes.ts`: `GET /health`
- [ ] `src/middleware/error-handler.ts`: onError → формат ошибки из shared, лог через Pino
- [ ] `src/lib/logger.ts`: Pino (pretty в dev)
- [ ] `src/lib/env.ts`: Zod-валидация process.env при старте (PORT, WEB_ORIGIN)

## Затрагиваемые файлы
- `apps/api/**` — создать

## Критерии приёмки
- [ ] `curl http://localhost:3000/api/v1/health` → 200 `{"status":"ok"}`
- [ ] Несуществующий роут → 404 в едином формате ошибки
- [ ] Старт без обязательной env-переменной падает с понятным сообщением

## Как проверить
```bash
pnpm --filter @orbital/api dev
curl -i http://localhost:3000/api/v1/health
curl -i http://localhost:3000/api/v1/nope
```

## Подводные камни
`@hono/node-server` обязателен (Hono сам по себе не слушает порт в Node). ESM: `"type":"module"`
и расширения в импортах при NodeNext — либо использовать `moduleResolution: bundler` + tsx.
