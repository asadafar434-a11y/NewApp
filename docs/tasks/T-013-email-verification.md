# T-013: Подтверждение email — Unisender Go

**Фаза:** 2 · **Оценка:** 4ч · **Зависит от:** T-012 · **Статус:** done (без реальной Unisender-отправки — нет ключа)

## Цель
Регистрация шлёт настоящее письмо; без подтверждения API отвечает 403 EMAIL_NOT_VERIFIED.

## Контекст
Флоу — [07-auth-and-security.md](../07-auth-and-security.md#регистрация). Подтверждение
**обязательно** (FR-2). Модуль email изолирован: [03-architecture.md](../03-architecture.md),
lib/email.

## Что сделать
- [ ] Завести аккаунт Unisender Go, получить API-ключ, подтвердить домен отправителя (пока можно sandbox/личный домен)
- [ ] `src/lib/email/index.ts`: `sendEmail(template, to, vars)` → Unisender Go API (`https://go1.unisender.ru/ru/transactional/api/v1/email/send.json`); в dev (`NODE_ENV!=production`) — лог в консоль
- [ ] Шаблоны: `verify` (ссылка подтверждения), `reset` (T-014), `chat-invite` (T-025) — простые HTML на русском
- [ ] Better Auth: `requireEmailVerification: true`, `sendOnSignUp: true`, подключить sendEmail
- [ ] Middleware (после auth): если сессия есть, но `emailVerified=false` → 403 `EMAIL_NOT_VERIFIED` (кроме /auth/*)
- [ ] env: UNISENDER_GO_API_KEY, EMAIL_FROM

## Затрагиваемые файлы
- `apps/api/src/lib/email/**` — создать
- `apps/api/src/lib/auth.ts`, `src/middleware/` — изменить

## Критерии приёмки
- [ ] Регистрация в dev пишет ссылку в лог; переход по ней ставит emailVerified=true
- [ ] До подтверждения `GET /api/v1/me` → 403 EMAIL_NOT_VERIFIED; после → 200
- [ ] Реальное письмо доходит при заданном ключе (ручная проверка один раз)

## Как проверить
Регистрация → взять URL из лога → `curl` по нему → повторить /me с кукой.

## Подводные камни
Домен отправителя без подтверждения в Unisender → письма в спам или reject; для MVP подтвердить
домен сразу. Ссылка подтверждения должна вести на фронт (`WEB_ORIGIN/verify-email?...`) — настроить
`emailVerification.autoSignInAfterVerification` и callback URL.
