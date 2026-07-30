# T-026: Звонки — планирование и отмена

**Фаза:** 3 · **Оценка:** 3ч · **Зависит от:** T-020 · **Статус:** todo

## Цель
Существующие модалка планирования и вкладка «Звонки» в Hiring работают от БД.

## Контекст
`/calls` — [05-api.md](../05-api.md). UI уже готов: ScheduleModal, вкладка Calls
(`scheduledCalls` state в Hiring.tsx) — заменяем состояние на серверные данные.

## Что сделать
- [ ] shared: `schemas/call.ts` (create: specialistId, scheduledAt ISO, link; entity)
- [ ] API routes/service/repo: GET /calls?from&to, POST, PATCH /:id (перенос/status=canceled/completed+resultNote)
- [ ] Смена статуса специалиста при планировании: hire → `scheduled`, consult → `consult_scheduled` (через changeStatus из T-021, в той же транзакции)
- [ ] Фронт: `api/calls.ts`; ScheduleModal → useCreateCall (дата+время → один ISO); вкладка Calls → useCalls; отмена → PATCH
- [ ] Vitest: создание меняет статус специалиста по типу заявки; изоляция компаний

## Затрагиваемые файлы
- `packages/shared/src/schemas/call.ts` — создать
- `apps/api/src/{routes,services,repositories}/calls.*` — создать
- `apps/web/src/api/calls.ts`, `src/pages/Hiring.tsx` — изменить

## Критерии приёмки
- [ ] Запланированный звонок виден во вкладке Calls после F5 и на magic-странице специалиста
- [ ] Отмена убирает из «предстоящих», статус звонка canceled (не удаление)
- [ ] Статус специалиста обновился по типу заявки

## Как проверить
UI-планирование из CandidateDetail → вкладка Calls → инкогнито magic-страница.

## Подводные камни
Часовые пояса: хранить UTC, показывать локально; в UI планирования явно подписать «ваше время».
Прошедшие звонки — не показывать в «предстоящих» (фильтр from=now на сервере).
