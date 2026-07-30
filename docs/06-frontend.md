# 06 — Фронтенд

Существующий UI (React 19 + Vite, инлайн-стили с токенами из `src/index.css`) — сохраняем.
Tailwind/shadcn из стека используем только для новых экранов; существующие не переписываем.

> **Решение по роутеру:** в коде уже react-router v7 (data mode). Миграция на TanStack Router
> из зафиксированного стека **отложена до v2** — переписывание роутинга не даёт ценности MVP.
> Зафиксировано в [ADR-0006](adr/ADR-0006-unified-request.md) (раздел «Последствия»).
> TanStack Query внедряем сразу — вся работа с сервером только через него.

## Карта роутов

| Роут | Экран | Статус | Эндпоинты |
|---|---|---|---|
| `/auth` | Auth | есть, подключить к API | Better Auth sign-in/sign-up |
| `/verify-email` | Подтверждение почты | **новый** | Better Auth verify + resend |
| `/reset-password` | Сброс пароля | **новый** | Better Auth reset |
| `/` | Dashboard | есть, на реальные данные | GET /dashboard, /notifications |
| `/hiring` | Hiring (3 панели) | есть, на реальные данные | /requests, /specialists, /calls, /ai/tasks (kind=hiring) |
| `/hiring` — заявки | выбор/создание заявки | **дораб.: селектор заявки** | GET/POST /requests |
| `/finance` | Finance | есть + CRUD-формы записей | /finance/records, /finance/analyze |
| `/marketing` | Marketing | есть + CRUD кампаний | /marketing/campaigns, /marketing/analyze |
| `/operations` | Operations | есть + CRUD задач | /ops/tasks, /ops/tasks/:id/run |
| `/new-task` | NewTask | есть, реальный AI-стриминг | /ai/tasks, /ai/usage |
| `/messages` | Messages | есть, на реальные данные | /conversations, /events (SSE) |
| `/payments` | История платежей | **новый** (простая таблица) | GET /payments |
| `/chat/:token` | Страница специалиста | **новый, вне Root-layout** | /public/chat/:token/* |

`/chat/:token` — публичный лёгкий экран (логотип + тред + звонки), без сайдбара и AuthContext.

## Слой данных: TanStack Query

```
apps/web/src/api/
├── client.ts        # fetch-обёртка: baseUrl, credentials:'include', парсинг errorResponse
├── queryKeys.ts     # фабрика ключей
├── requests.ts      # хуки useRequests, useCreateRequest, ...
├── specialists.ts
├── chat.ts          # + подписка на SSE
├── payments.ts
├── finance.ts
├── marketing.ts
├── ops.ts
├── ai.ts            # + чтение стриминга
└── notifications.ts
```

Ключи и инвалидация:

| Ключ | Инвалидируется после |
|---|---|
| `['me']` | login/logout, PATCH /company |
| `['dashboard']` | любых мутаций разделов (мягко: staleTime 30 с) |
| `['requests']`, `['requests', id]` | create/update/delete request, смена статуса специалиста |
| `['specialists', filters]`, `['specialists', id]` | CRUD специалиста, смена статуса, match |
| `['conversations']` | send/read message, SSE `message:new` |
| `['messages', conversationId]` | send message; SSE пишет в кэш через `setQueryData` (без рефетча) |
| `['calls']` | CRUD звонка |
| `['payments']` | POST /payments, SSE `payment:status` |
| `['finance']`, `['campaigns']`, `['ops']` | CRUD соответствующего раздела |
| `['ai', 'usage']` | завершение любого AI-стрима |
| `['notifications']` | read/read-all, SSE-события |

Правила: `staleTime` 30 с по умолчанию; мутации → `invalidateQueries` по таблице;
SSE-сообщения чата — оптимистично в кэш, без рефетча. Отправка сообщения — optimistic update
(статус sent → подтверждение сервером).

## Состояние

- **Серверное** — только TanStack Query (кэш = единственный источник).
- **UI-состояние** (выбранный кандидат, открытая модалка, табы) — `useState` на странице, как сейчас.
- **Auth** — `AuthContext` остаётся, внутри — Better Auth client (`useSession`); формы Auth.tsx
  переключаются на реальные вызовы.
- Глобального стора нет и не нужен.

## Загрузка / ошибки / пустые состояния

- Каждый экран: скелетон (существующая стилистика) при `isPending`; тост (sonner уже в зависимостях)
  при ошибке мутации; инлайн-блок «не удалось загрузить — повторить» при ошибке запроса.
- Пустые состояния уже нарисованы (Hiring detail, Messages) — дополнить для списков:
  «Нет заявок — создайте первую», «Добавьте записи, чтобы AI провёл анализ» (Finance/Marketing).
- 401 в `client.ts` → редирект на `/auth`; `EMAIL_NOT_VERIFIED` → `/verify-email`;
  `TOKEN_LIMIT` → тост с остатком лимита из `/ai/usage`.

## Что менять в существующем UI

| Файл | Что сделать |
|---|---|
| `context/AuthContext.tsx` | Заменить симуляцию на Better Auth client; user из сессии |
| `pages/Auth.tsx` | Реальные login/signup, обработка ошибок (email занят и т.п.) |
| `pages/Root.tsx` | Бейдж Messages и счётчик Bell — из `['notifications']`/`['conversations']`; пункт «Платежи» |
| `pages/Dashboard.tsx` | `STATS`, `TASKS`, `NOTIFICATIONS` → GET /dashboard, /notifications |
| `pages/Hiring.tsx` | `ALL_CANDIDATES` → useSpecialists; статусы/звонки/сообщения → мутации; AI-чат → /ai/tasks kind=hiring; добавить селектор заявки и форму специалиста; `AI_RESPONSES` удалить |
| `pages/Messages.tsx` | `INITIAL_CONVERSATIONS` → useConversations; отправка → мутация; статусы прочтения → /read + SSE; симуляции setTimeout удалить |
| `pages/Finance.tsx` | `REVENUE_DATA`, `EXPENSE_DATA`, `ISSUES` → /finance/records (+агрегация), /finance/analyze; добавить форму записи |
| `pages/Marketing.tsx` | `CAMPAIGN_DATA`, `CAMPAIGNS` → /marketing/campaigns; форма кампании; анализ → /marketing/analyze |
| `pages/Operations.tsx` | `TASKS`, `KPI_ITEMS` → /ops/tasks; запуск → /run с реальным статусом |
| `pages/NewTask.tsx` | `AI_REPLIES` удалить; стриминг из /ai/tasks; история диалогов |

Недостающие экраны: `/verify-email`, `/reset-password`, `/payments`, `/chat/:token`,
модальные формы: заявка, специалист, финансовая запись, кампания, ops-задача.

Мок-данные из существующих файлов переносятся в `apps/api/prisma/seed.ts` как демо-сиды —
UI после подключения выглядит так же, но данные приходят из БД.
