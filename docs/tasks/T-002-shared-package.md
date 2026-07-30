# T-002: packages/shared — общие Zod-схемы

**Фаза:** 0 · **Оценка:** 2ч · **Зависит от:** T-001 · **Статус:** todo

## Цель
Пакет `@orbital/shared` собирается и импортируется из web; первая схема (error) на месте.

## Контекст
Все типы API живут в shared и используются фронтом и бэком: [05-api.md](../05-api.md).

## Что сделать
- [ ] `packages/shared/package.json`: name `@orbital/shared`, deps: `zod`; exports на `./dist`
- [ ] `tsconfig.json` (наследует base, `composite: true`), скрипт `build: tsc`
- [ ] `src/schemas/error.ts` — errorResponseSchema из 05-api.md; `src/index.ts` — реэкспорт
- [ ] В `apps/web` добавить зависимость `"@orbital/shared": "workspace:*"`, импортнуть тип ошибки в любом файле как smoke-тест

## Затрагиваемые файлы
- `packages/shared/**` — создать
- `apps/web/package.json` — изменить

## Критерии приёмки
- [ ] `pnpm --filter @orbital/shared build` создаёт dist с .d.ts
- [ ] Импорт `import { errorResponseSchema } from '@orbital/shared'` в web компилируется

## Как проверить
```bash
pnpm --filter @orbital/shared build
pnpm -r typecheck
```

## Подводные камни
Забытая сборка shared перед typecheck зависимых пакетов — добавить `pnpm -r build` порядок
(pnpm сам топологически сортирует). Для dev-режима web использовать `tsc --watch` shared или
vite-алиас на `src` — выбрать алиас, он проще.
