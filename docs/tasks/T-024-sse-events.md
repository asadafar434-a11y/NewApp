# T-024: SSE — реалтайм-доставка сообщений

**Фаза:** 3 · **Оценка:** 3ч · **Зависит от:** T-023 · **Статус:** todo

## Цель
Открытая вкладка получает новые сообщения и статусы прочтения без перезагрузки.

## Контекст
[ADR-0005](../adr/ADR-0005-sse-chat.md); формат событий — [05-api.md](../05-api.md#sse).
Hono поддерживает SSE через `streamSSE`.

## Что сделать
- [ ] `src/lib/sse/index.ts`: реестр `Map<companyId, Set<subscriber>>` + `publish(companyId, event)`; heartbeat каждые 30 с; удаление подписчика при разрыве
- [ ] `GET /events` (auth): streamSSE, подписка на companyId
- [ ] messages.service: после create → publish `message:new`; после read → `message:status`
- [ ] Фронт `api/chat.ts`: EventSource на /events; `message:new` → setQueryData в ['messages', conversationId] + инвалидация ['conversations']; подключение один раз на приложение (в Root)
- [ ] Vitest (юнит lib/sse): publish доходит подписчику компании и не доходит чужому

## Затрагиваемые файлы
- `apps/api/src/lib/sse/**`, `src/routes/events.routes.ts` — создать
- `apps/api/src/services/messages.service.ts` — изменить
- `apps/web/src/api/chat.ts`, `src/pages/Root.tsx` — изменить

## Критерии приёмки
- [ ] Два окна (одна компания): сообщение из одного мгновенно в другом
- [ ] Обрыв (перезапуск API) → EventSource переподключается сам, чат продолжает работать
- [ ] Heartbeat виден в Network (комментарий-строка каждые 30 с)

## Как проверить
Два окна браузера рядом; `docker`/ctrl-C рестарт API в процессе.

## Подводные камни
EventSource не шлёт куки на другой origin — в dev работает через vite proxy (same-origin).
Утечка подписчиков: обязательно чистить Set в `onAbort`.
