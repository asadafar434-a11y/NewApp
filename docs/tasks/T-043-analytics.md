# T-043: Аналитика — серверные события + Метрика

**Фаза:** 4 · **Оценка:** 3ч · **Зависит от:** T-016 · **Статус:** todo

## Цель
Ключевые действия пишутся в AnalyticsEvent; Яндекс.Метрика собирает веб-аналитику.

## Контекст
FR-30; модель — [04-data-model.md](../04-data-model.md). События минимального набора:
`signup, request_created, specialist_created, message_sent, call_scheduled, payment_succeeded,
consult_completed, ai_task_created`.

## Что сделать
- [ ] `src/lib/analytics.ts`: `track(name, companyId?, props?)` — insert fire-and-forget (ошибка → warn-лог, не роняет запрос)
- [ ] Вызовы track из соответствующих сервисов (8 точек)
- [ ] Фронт: скрипт Метрики в index.html по VITE_METRIKA_ID (не грузить без id); reachGoal на те же события UI-стороны
- [ ] Мини-отчёт для себя: SQL-вьюха или запрос в докe — события по дням (для admin, UI не нужен)
- [ ] Vitest: track не бросает при ошибке БД (мок)

## Затрагиваемые файлы
- `apps/api/src/lib/analytics.ts` — создать; 8 сервисов — по одной строке
- `apps/web/index.html` — изменить

## Критерии приёмки
- [ ] Прогон золотого пути создаёт цепочку событий в AnalyticsEvent
- [ ] Без VITE_METRIKA_ID скрипт Метрики не загружается (dev чистый)
- [ ] track при недоступной БД не ломает основной запрос

## Как проверить
Пройти путь → `select name, count(*) from "AnalyticsEvent" group by 1`.

## Подводные камни
В props не класть ПД (email, имена) — только id и суммы. Метрика блокируется адблоками —
серверные события первичны для метрик успеха MVP.
