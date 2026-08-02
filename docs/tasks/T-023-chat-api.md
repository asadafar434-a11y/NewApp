# T-023: Чат — API и Messages на реальных данных

**Фаза:** 3 · **Оценка:** 4ч · **Зависит от:** T-019 · **Статус:** done

## Цель
Экран Messages показывает реальные диалоги; отправка сообщения сохраняется в БД.

## Контекст
Схемы `chat.ts` — [05-api.md](../05-api.md#zod-схемы-ядра). Реалтайм (SSE) — следующая задача
T-024; здесь доставка «после рефетча». Email-уведомление специалисту — T-025.

## Что сделать
- [x] shared: `schemas/chat.ts`
- [x] API: `conversations.routes/service/repo`: GET /conversations (с последним сообщением и unread — один запрос с группировкой), GET /:id/messages (курсор от новых к старым), POST /:id/messages (sender=owner), POST /:id/read (входящие specialist → read)
- [x] Vitest: изоляция компаний, unread-счётчик, порядок сообщений
- [x] Фронт `Messages.tsx`: `INITIAL_CONVERSATIONS` → useConversations; тред → useMessages(id); отправка → мутация с optimistic update; выбор диалога → POST /read; удалить симуляции setTimeout
- [x] Мок-статусы delivered/read: у owner-сообщений status=sent до T-025 (появление magic-страницы), UI это уже умеет

## Затрагиваемые файлы
- `packages/shared/src/schemas/chat.ts` — создан
- `apps/api/src/{routes,services,repositories}/conversations.*` — созданы
- `apps/api/src/repositories/specialists.repo.ts` — не менялся, но обнаружен и исправлен смежный
  баг: soft-delete специалиста (T-020) не каскадируется на Conversation — `conversations.repo.ts`
  теперь дополнительно фильтрует `specialist: { deletedAt: null }` в `list`/`get`
- `apps/web/src/api/chat.ts` — создан; `src/pages/Messages.tsx` — переписан на реальные данные
  (мок `INITIAL_CONVERSATIONS`, поля `online`/`source` без бэкенд-данных удалены)

## Критерии приёмки
- [x] После сидов Messages выглядит как с моками; отправленное сообщение переживает F5 —
  проверено вживую (реальный POST 201, сообщение осталось после навигации/релоада)
- [x] Открытие диалога обнуляет unread-бейдж — проверено вживую: вставили входящее сообщение
  напрямую в БД (публичного chat-эндпоинта для специалиста ещё нет, появится в T-025),
  бейдж «1» показался в списке, после открытия диалога — POST /read (204) и бейдж пропал
- [x] Тесты зелёные — 7 файлов / 42 теста (8 новых в conversations.test.ts)

## Как проверить
UI + Studio (Message создан) + тесты.

## Подводные камни
Optimistic update: откат при ошибке мутации (onError → setQueryData назад). Список диалогов
сортировать по времени последнего сообщения, не по createdAt диалога.

## Находки
- **Soft-delete специалиста не каскадируется на Conversation.** При живой проверке диалоги
  удалённых в предыдущих задачах тестовых специалистов продолжали показываться в Messages.
  Prisma `onDelete: Cascade` в схеме относится только к настоящему `DELETE`, а не к
  soft-delete (`deletedAt` — обычное поле, БД о нём не знает). Исправлено фильтром
  `specialist: { deletedAt: null }` в `conversationsRepo.list`/`get`; покрыто тестом.
- `online`/`source` из мока `Conversation` убраны — в `conversationListItemSchema` (05-api.md)
  этих полей нет и взять их не откуда (presence не хранится нигде, `source` — атрибут
  специалиста, а не диалога).
