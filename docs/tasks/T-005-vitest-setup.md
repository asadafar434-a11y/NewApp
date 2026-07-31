# T-005: Vitest на api + первый тест

**Фаза:** 0 · **Оценка:** 2ч · **Зависит от:** T-003 · **Статус:** done

## Цель
`pnpm --filter @orbital/api test` запускает Vitest; тест /health зелёный.

## Контекст
Тестовая политика — [09-conventions.md](../09-conventions.md#тесты): тесты с первого дня,
каждая следующая фича добавляет свои.

## Что сделать
- [ ] devDeps api: `vitest`; скрипт `test: vitest run`, `test:watch: vitest`
- [ ] `apps/api/vitest.config.ts` (node environment)
- [ ] `apps/api/test/health.test.ts`: через `app.request('/api/v1/health')` (Hono тестируется без сети) проверить 200 и тело
- [ ] Тест формата ошибок: несуществующий роут → 404 + errorResponseSchema.parse проходит

## Затрагиваемые файлы
- `apps/api/vitest.config.ts`, `apps/api/test/health.test.ts` — создать
- `apps/api/package.json` — изменить

## Критерии приёмки
- [ ] `pnpm --filter @orbital/api test` — 2+ теста, зелёные
- [ ] Тесты не требуют запущенного сервера и БД

## Как проверить
```bash
pnpm --filter @orbital/api test
```

## Подводные камни
Экспортировать `app` отдельно от `serve()` (иначе тесты поднимут сервер). env-валидация при
импорте app — задать тестовые env в vitest.config `env` или setup-файле.
