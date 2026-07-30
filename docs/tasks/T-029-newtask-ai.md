# T-029: NewTask — реальный AI-чат со стримингом

**Фаза:** 3 · **Оценка:** 4ч · **Зависит от:** T-028 · **Статус:** todo

## Цель
NewTask ведёт настоящий диалог с Claude: ответ печатается по мере генерации, история сохраняется.

## Контекст
Эндпоинты /ai/tasks — [05-api.md](../05-api.md); схемы `ai.ts`. Мок AI_REPLIES удаляется.
Системный контекст: название компании + сводка (число заявок/специалистов, последние финансы) —
собирает сервис.

## Что сделать
- [ ] shared: `schemas/ai.ts`
- [ ] API: `ai-tasks.service.ts`: create (kind, первое сообщение) и addMessage — оба: checkLimit → сохранить user-сообщение → streamChat → SSE-чанки клиенту → сохранить assistant-сообщение + addUsage; `buildCompanyContext(companyId)`
- [ ] Роуты: POST /ai/tasks (стрим), POST /ai/tasks/:id/messages (стрим), GET /ai/tasks, GET /ai/tasks/:id
- [ ] Фронт `NewTask.tsx`: удалить AI_REPLIES; отправка → fetch-стрим (ReadableStream), появление текста чанками; typing-индикатор до первого чанка; suggestions создают диалог; история диалогов (простой список слева или дропдаун)
- [ ] Ошибка TOKEN_LIMIT → сообщение в чате «Лимит AI на месяц исчерпан»
- [ ] Vitest: create сохраняет оба сообщения, usage инкрементится (ai замокан)

## Затрагиваемые файлы
- `packages/shared/src/schemas/ai.ts`, `apps/api/src/{services,routes}/ai-tasks.*` — создать
- `apps/web/src/api/ai.ts` — создать; `src/pages/NewTask.tsx` — изменить

## Критерии приёмки
- [ ] Вопрос «профит падает, что посоветуешь?» получает осмысленный русский ответ стримом
- [ ] F5 — диалог в истории целиком
- [ ] /ai/usage вырос после диалога

## Как проверить
UI-диалог + Studio (AiTask/AiMessage) + curl /ai/usage.

## Подводные камни
EventSource не умеет POST — стриминг читать через fetch + ReadableStream. Прерывание генерации
(уход со страницы) — abort и сохранить накопленный текст.
