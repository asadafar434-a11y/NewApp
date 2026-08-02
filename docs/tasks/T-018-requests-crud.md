# T-018: Заявки (Request) — CRUD + UI

**Фаза:** 3 · **Оценка:** 4ч · **Зависит от:** T-016 · **Статус:** done

## Цель
Владелец создаёт заявку (найм/консультация) из Hiring и видит список своих заявок.

## Контекст
Схемы — [05-api.md](../05-api.md#zod-схемы-ядра) (`request.ts` в shared). Первая полная
вертикаль routes→service→repo — она задаёт образец для всех следующих CRUD.

## Что сделать
- [x] shared: `schemas/request.ts` из 05-api.md
- [x] API: `requests.repo.ts` (list/get/create/update/softDelete, всегда companyId + deletedAt:null), `requests.service.ts` (права, проверка цены для consult), `requests.routes.ts` (GET/POST/GET:id/PATCH/DELETE, zValidator)
- [x] Vitest: создание hire без цены ок; consult без цены → 400; чужая компания → 404; удаление скрывает из списка
- [x] Фронт: `api/requests.ts` (useRequests, useCreateRequest…); в Hiring — селектор активной заявки над списком специалистов + модалка «Новая заявка» (тип, название, описание, цена для consult — в рублях, конвертация в копейки в хуке)

## Затрагиваемые файлы
- `packages/shared/src/schemas/request.ts` — создан
- `apps/api/src/{routes,services,repositories}/requests.*` — созданы
- `apps/api/src/lib/validation.ts` — создан (общий zValidator error hook, переиспользуется будущими роутами)
- `apps/web/src/api/requests.ts`, `src/pages/Hiring.tsx` (`RequestSelector`, `NewRequestModal`) — созданы/изменены

## Критерии приёмки
- [x] Из UI создаются заявки обоих типов и появляются в селекторе без перезагрузки — проверено вживую в браузере (hire «Frontend-разработчик» и consult «Аудит юнит-экономики» на 7 500 ₽, оба появились в дропдауне сразу после закрытия модалки)
- [x] `curl` от другого пользователя не видит чужих заявок — второй пользователь получил `{"items":[]}` на списке и 404 NOT_FOUND при прямом GET чужой заявки по id
- [x] Тесты зелёные — 4 файла / 15 тестов, включая 6 новых в `requests.test.ts`

## Как проверить
UI-флоу + `pnpm --filter @orbital/api test`.

## Подводные камни
Это образец слоёв — не срезать (логика в роуте = расползание по всем следующим задачам).
Цена: UI в рублях, API в копейках — конвертация в одном месте (хук).

## Найденные и исправленные баги
1. **Hono sub-router middleware leak**: `.use(requireAuth)` на под-`Hono()` для `/requests`
   протекал на ВСЕ роуты, смонтированные на тот же префикс `/api/v1` (health, me) — Hono
   мёрджит unscoped `.use()` подроутера в родительский роутинг при `app.route(prefix, sub)`,
   если другие подроутеры используют тот же префикс. Сломало `health.test.ts` (404→401) и часть
   `auth.test.ts`. Исправлено передачей `requireAuth` явным аргументом в каждый роут вместо
   `.use()`.
2. **Race condition в тестах**: несколько файлов бьют в одну `orbital_test` с `truncateAll()` в
   `beforeEach` — при параллельном запуске файлов (дефолт Vitest) один файл иногда стирал
   пользователя другого между `signUp` и `signIn`, изредка ловилось как
   `sign-in не вернул Set-Cookie`. Исправлено `fileParallelism: false` в `vitest.config.ts`.
