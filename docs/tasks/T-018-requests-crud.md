# T-018: Заявки (Request) — CRUD + UI

**Фаза:** 3 · **Оценка:** 4ч · **Зависит от:** T-016 · **Статус:** todo

## Цель
Владелец создаёт заявку (найм/консультация) из Hiring и видит список своих заявок.

## Контекст
Схемы — [05-api.md](../05-api.md#zod-схемы-ядра) (`request.ts` в shared). Первая полная
вертикаль routes→service→repo — она задаёт образец для всех следующих CRUD.

## Что сделать
- [ ] shared: `schemas/request.ts` из 05-api.md
- [ ] API: `requests.repo.ts` (list/get/create/update/softDelete, всегда companyId + deletedAt:null), `requests.service.ts` (права, проверка цены для consult), `requests.routes.ts` (GET/POST/GET:id/PATCH/DELETE, zValidator)
- [ ] Vitest: создание hire без цены ок; consult без цены → 400; чужая компания → 404; удаление скрывает из списка
- [ ] Фронт: `api/requests.ts` (useRequests, useCreateRequest…); в Hiring — селектор активной заявки над списком специалистов + модалка «Новая заявка» (тип, название, описание, цена для consult — в рублях, конвертация в копейки в хуке)

## Затрагиваемые файлы
- `packages/shared/src/schemas/request.ts` — создать
- `apps/api/src/{routes,services,repositories}/requests.*` — создать
- `apps/web/src/api/requests.ts`, `src/pages/Hiring.tsx`, компонент модалки — создать/изменить

## Критерии приёмки
- [ ] Из UI создаются заявки обоих типов и появляются в селекторе без перезагрузки
- [ ] `curl` от другого пользователя не видит чужих заявок
- [ ] Тесты зелёные

## Как проверить
UI-флоу + `pnpm --filter @orbital/api test`.

## Подводные камни
Это образец слоёв — не срезать (логика в роуте = расползание по всем следующим задачам).
Цена: UI в рублях, API в копейках — конвертация в одном месте (хук).
