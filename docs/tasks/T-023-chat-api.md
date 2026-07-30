# T-023: Чат — API и Messages на реальных данных

**Фаза:** 3 · **Оценка:** 4ч · **Зависит от:** T-019 · **Статус:** todo

## Цель
Экран Messages показывает реальные диалоги; отправка сообщения сохраняется в БД.

## Контекст
Схемы `chat.ts` — [05-api.md](../05-api.md#zod-схемы-ядра). Реалтайм (SSE) — следующая задача
T-024; здесь доставка «после рефетча». Email-уведомление специалисту — T-025.

## Что сделать
- [ ] shared: `schemas/chat.ts`
- [ ] API: `conversations.routes/service/repo`: GET /conversations (с последним сообщением и unread — один запрос с группировкой), GET /:id/messages (курсор от новых к старым), POST /:id/messages (sender=owner), POST /:id/read (входящие specialist → read)
- [ ] Vitest: изоляция компаний, unread-счётчик, порядок сообщений
- [ ] Фронт `Messages.tsx`: `INITIAL_CONVERSATIONS` → useConversations; тред → useMessages(id); отправка → мутация с optimistic update; выбор диалога → POST /read; удалить симуляции setTimeout
- [ ] Мок-статусы delivered/read: у owner-сообщений status=sent до T-025 (появление magic-страницы), UI это уже умеет

## Затрагиваемые файлы
- `packages/shared/src/schemas/chat.ts` — создать
- `apps/api/src/{routes,services,repositories}/conversations.*` — создать
- `apps/web/src/api/chat.ts` — создать; `src/pages/Messages.tsx` — изменить

## Критерии приёмки
- [ ] После сидов Messages выглядит как с моками; отправленное сообщение переживает F5
- [ ] Открытие диалога обнуляет unread-бейдж
- [ ] Тесты зелёные

## Как проверить
UI + Studio (Message создан) + тесты.

## Подводные камни
Optimistic update: откат при ошибке мутации (onError → setQueryData назад). Список диалогов
сортировать по времени последнего сообщения, не по createdAt диалога.
