# 05 — Контракт API

Базовый префикс: `/api/v1`. Все схемы живут в `packages/shared/src/schemas/` и используются
и бэкендом (валидация), и фронтом (типы, парсинг ответов).

## Общие правила

### Формат ошибки (единый)

```ts
// packages/shared/src/schemas/error.ts
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),        // 'UNAUTHORIZED', 'NOT_FOUND', 'VALIDATION', 'TOKEN_LIMIT', ...
    message: z.string(),     // человекочитаемо, по-русски — показывается в UI
    details: z.record(z.unknown()).optional(), // поле → ошибка при VALIDATION
  }),
})
```

| HTTP | code | Когда |
|---|---|---|
| 400 | VALIDATION | Zod не прошёл; details = fieldErrors |
| 401 | UNAUTHORIZED | Нет/протухла сессия или magic-токен |
| 403 | FORBIDDEN | Чужой ресурс, роль не позволяет, email не подтверждён (`EMAIL_NOT_VERIFIED`) |
| 404 | NOT_FOUND | Нет записи или она soft-deleted |
| 409 | CONFLICT | Дубликат (email занят, повторная оплата) |
| 422 | TOKEN_LIMIT | Исчерпан месячный лимит AI-токенов |
| 429 | RATE_LIMITED | Превышен rate limit |
| 500 | INTERNAL | Непредвиденная ошибка (детали только в Sentry/логах) |

### Пагинация, сортировка, фильтрация

- Курсорная пагинация: `?cursor=<id>&limit=20` (limit ≤ 100). Ответ-обёртка:
  `{ items: T[], nextCursor: string | null }`.
- Сортировка: `?sort=createdAt&order=desc` — только по явно разрешённым полям каждого эндпоинта.
- Фильтры — явные query-параметры (`?status=new&requestId=...`), валидируются Zod.
- Списки ≤ ~100 записей (звонки, заявки) отдаются без пагинации массивом.

### Версионирование и rate limiting

- Версия в пути (`/api/v1`); ломающие изменения → `/api/v2`, v1 живёт до миграции фронта.
- Rate limits (in-memory, на инстанс): auth-эндпоинты — 10 req/мин на IP;
  AI-эндпоинты — 20 req/мин на компанию; публичный чат — 30 req/мин на токен;
  остальное — 300 req/мин на сессию. Превышение → 429.

## Таблица эндпоинтов

Авторизация: `owner` — сессионная кука + `companyId` из сессии; `magic` — токен специалиста
в пути; `public` — без авторизации; `admin` — роль admin; `webhook` — подпись/IP-фильтр ЮKassa.

| Метод | Путь | Auth | Назначение |
|---|---|---|---|
| * | `/auth/*` | public | Better Auth: sign-up, sign-in, sign-out, verify-email, reset-password |
| GET | `/health` | public | `{ status: 'ok', db: true }` для мониторинга |
| GET | `/me` | owner | Текущий пользователь + компания |
| PATCH | `/company` | owner | Переименовать компанию |
| DELETE | `/company` | owner | Soft-delete аккаунта (окно 30 дней) |
| GET | `/dashboard` | owner | Агрегаты для дашборда |
| GET | `/requests` | owner | Список заявок (`?type=&status=`) |
| POST | `/requests` | owner | Создать заявку |
| GET | `/requests/:id` | owner | Заявка + её специалисты |
| PATCH | `/requests/:id` | owner | Изменить (title, description, price, status) |
| DELETE | `/requests/:id` | owner | Soft-delete (+ каскад на специалистов) |
| GET | `/specialists` | owner | Список (`?requestId=&status=&search=&cursor=`) |
| POST | `/specialists` | owner | Создать специалиста |
| GET | `/specialists/:id` | owner | Профиль + таймлайн статусов + звонки |
| PATCH | `/specialists/:id` | owner | Изменить профиль |
| POST | `/specialists/:id/status` | owner | Сменить статус (валидация перехода, лог) |
| DELETE | `/specialists/:id` | owner | Soft-delete |
| POST | `/specialists/:id/match` | owner | AI match-оценка (обновляет matchScore/matchReason) |
| POST | `/uploads/presign` | owner | Presigned URL для загрузки (resume/avatar) |
| GET | `/conversations` | owner | Список диалогов с последним сообщением и unread |
| GET | `/conversations/:id/messages` | owner | Сообщения (`?cursor=`) |
| POST | `/conversations/:id/messages` | owner | Отправить сообщение (+email специалисту при необходимости) |
| POST | `/conversations/:id/read` | owner | Отметить входящие прочитанными |
| GET | `/events` | owner | SSE-поток: новые сообщения, смены статусов платежей |
| GET | `/calls` | owner | Предстоящие звонки (`?from=&to=`) |
| POST | `/calls` | owner | Запланировать звонок |
| PATCH | `/calls/:id` | owner | Перенести / отменить / завершить + resultNote |
| GET | `/payments` | owner | История платежей |
| POST | `/payments` | owner | Создать платёж ЮKassa за консультацию → confirmationUrl |
| POST | `/webhooks/yookassa` | webhook | Обновление статуса платежа |
| GET | `/finance/records` | owner | Записи (`?from=&to=&kind=`) |
| POST | `/finance/records` | owner | Создать запись |
| PATCH | `/finance/records/:id` | owner | Изменить |
| DELETE | `/finance/records/:id` | owner | Удалить (hard) |
| POST | `/finance/analyze` | owner | AI-анализ → список проблем |
| GET | `/marketing/campaigns` | owner | Кампании |
| POST | `/marketing/campaigns` | owner | Создать |
| PATCH | `/marketing/campaigns/:id` | owner | Изменить |
| DELETE | `/marketing/campaigns/:id` | owner | Удалить (hard) |
| POST | `/marketing/analyze` | owner | AI-аудит кампаний |
| GET | `/ops/tasks` | owner | Задачи-автоматизации |
| POST | `/ops/tasks` | owner | Создать |
| PATCH | `/ops/tasks/:id` | owner | Изменить |
| DELETE | `/ops/tasks/:id` | owner | Soft-delete |
| POST | `/ops/tasks/:id/run` | owner | Запуск → OpsRun + AI-отчёт |
| GET | `/ops/tasks/:id/runs` | owner | История запусков |
| GET | `/ai/tasks` | owner | Список AI-диалогов (`?kind=`) |
| POST | `/ai/tasks` | owner | Новый диалог (kind, первое сообщение) — стриминг ответа |
| GET | `/ai/tasks/:id` | owner | Диалог с сообщениями |
| POST | `/ai/tasks/:id/messages` | owner | Сообщение в диалог — стриминг ответа (SSE-чанки) |
| GET | `/ai/usage` | owner | Потрачено токенов за месяц / лимит |
| GET | `/notifications` | owner | Уведомления (`?unread=1`) |
| POST | `/notifications/:id/read` | owner | Прочитать одно |
| POST | `/notifications/read-all` | owner | Прочитать все |
| GET | `/public/chat/:token` | magic | Данные для страницы специалиста: имя компании, сообщения, звонки |
| POST | `/public/chat/:token/messages` | magic | Ответ специалиста |
| GET | `/public/chat/:token/events` | magic | SSE-поток входящих для специалиста |
| POST | `/admin/refunds` | admin | Инициировать возврат платежа |
| GET | `/admin/companies` | admin | Список компаний (поддержка) |

## Zod-схемы ядра

```ts
// packages/shared/src/schemas/request.ts
export const requestTypeSchema = z.enum(['hire', 'consult'])
export const requestStatusSchema = z.enum(['open', 'in_progress', 'done', 'canceled'])

export const createRequestSchema = z.object({
  type: requestTypeSchema,
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  priceKopecks: z.number().int().positive().max(100_000_000).nullable(),
}).refine((v) => v.type !== 'consult' || v.priceKopecks !== null, {
  message: 'Для консультации нужна цена', path: ['priceKopecks'],
})

export const requestSchema = z.object({
  id: z.string(), type: requestTypeSchema, title: z.string(),
  description: z.string(), priceKopecks: z.number().int().nullable(),
  status: requestStatusSchema, specialistCount: z.number().int(),
  createdAt: z.string().datetime(),
})
export const updateRequestSchema = createRequestSchema.innerType().partial()
  .extend({ status: requestStatusSchema.optional() })
```

```ts
// packages/shared/src/schemas/specialist.ts
export const specialistStatusSchema = z.enum([
  'new', 'contacted', 'scheduled', 'interviewed', 'hired', 'rejected',
  'consult_scheduled', 'consult_done',
])

export const createSpecialistSchema = z.object({
  requestId: z.string(),
  name: z.string().min(2).max(200),
  role: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  exp: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  salary: z.string().max(100).optional(),
  source: z.string().max(100).optional(),
  skills: z.array(z.string().max(50)).max(30).default([]),
  about: z.string().max(5000).optional(),
  portfolioUrl: z.string().url().optional(),
  availability: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  resumeKey: z.string().optional(),
  avatarKey: z.string().optional(),
})

export const specialistSchema = createSpecialistSchema.extend({
  id: z.string(), status: specialistStatusSchema,
  matchScore: z.number().int().min(0).max(100).nullable(),
  matchReason: z.string().nullable(),
  createdAt: z.string().datetime(),
})

export const changeStatusSchema = z.object({ status: specialistStatusSchema })
```

```ts
// packages/shared/src/schemas/chat.ts
export const messageSchema = z.object({
  id: z.string(),
  sender: z.enum(['owner', 'specialist']),
  text: z.string(),
  status: z.enum(['sent', 'delivered', 'read']),
  createdAt: z.string().datetime(),
})
export const sendMessageSchema = z.object({ text: z.string().min(1).max(5000) })
export const conversationListItemSchema = z.object({
  id: z.string(), specialistId: z.string(), specialistName: z.string(),
  specialistRole: z.string(), avatarKey: z.string().nullable(),
  lastMessage: messageSchema.nullable(), unreadCount: z.number().int(),
})
```

```ts
// packages/shared/src/schemas/payment.ts
export const createPaymentSchema = z.object({
  requestId: z.string(),
  specialistId: z.string().optional(),
})
export const paymentSchema = z.object({
  id: z.string(), requestId: z.string(), specialistId: z.string().nullable(),
  amountKopecks: z.number().int(), commissionPct: z.number().int(),
  status: z.enum(['pending', 'succeeded', 'canceled', 'refunded']),
  confirmationUrl: z.string().url().nullable(),
  paidAt: z.string().datetime().nullable(), createdAt: z.string().datetime(),
})
// сумма берётся из request.priceKopecks на сервере — клиент цену НЕ передаёт
```

```ts
// packages/shared/src/schemas/ai.ts
export const aiKindSchema = z.enum(['freeform', 'hiring', 'finance', 'marketing', 'operations'])
export const createAiTaskSchema = z.object({ kind: aiKindSchema, message: z.string().min(1).max(10_000) })
export const aiMessageSchema = z.object({
  id: z.string(), role: z.enum(['user', 'assistant']),
  content: z.string(), createdAt: z.string().datetime(),
})
export const aiUsageSchema = z.object({
  month: z.string(), tokensUsed: z.number().int(), tokensLimit: z.number().int(),
})
// Стриминг ответа: text/event-stream, события {type:'chunk',text} ... {type:'done',aiMessageId}
```

```ts
// packages/shared/src/schemas/finance.ts
export const createFinanceRecordSchema = z.object({
  kind: z.enum(['income', 'expense']),
  category: z.string().min(1).max(100),
  amountKopecks: z.number().int().positive(),
  period: z.string().regex(/^\d{4}-\d{2}$/), // '2026-08'
  note: z.string().max(500).optional(),
})
export const financeIssueSchema = z.object({
  severity: z.enum(['high', 'medium', 'low']),
  title: z.string(), detail: z.string(),
  impactKopecks: z.number().int().nullable(),
})
export const financeAnalyzeResponseSchema = z.object({ issues: z.array(financeIssueSchema) })
```

Схемы campaigns / ops / calls / notifications строятся по тому же образцу
(create*/update*/entity + обёртка списка) — прямое отражение колонок из
[04-data-model.md](04-data-model.md); файлы: `campaign.ts`, `ops.ts`, `call.ts`, `notification.ts`.

## SSE

- `GET /events` (owner): события `message:new`, `message:status`, `payment:status`,
  формат `data: {"type":"message:new","conversationId":"...","message":{...}}`.
- `GET /public/chat/:token/events` (magic): события `message:new` только своего диалога.
- Реализация: in-memory реестр подписчиков по companyId/conversationId (`lib/sse`);
  один инстанс API — брокер не нужен. Reconnect — стандартный механизм EventSource,
  пропущенное добирается обычным GET.

## Вебхук ЮKassa

`POST /webhooks/yookassa`: проверка IP-диапазонов ЮKassa, затем **подтверждающий GET**
платежа в API ЮKassa по `object.id` (не доверяем телу вебхука). Идемпотентность: обновление
`Payment.status` — no-op, если статус уже финальный. Ответ всегда 200 при валидном платеже.
