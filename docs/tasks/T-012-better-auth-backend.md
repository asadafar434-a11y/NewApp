# T-012: Better Auth — регистрация, вход, сессии

**Фаза:** 2 · **Оценка:** 4ч · **Зависит от:** T-008 · **Статус:** todo

## Цель
Через HTTP можно зарегистрироваться (создаётся Company) и войти; сессия живёт в httpOnly-куке.

## Контекст
Конфигурация — [07-auth-and-security.md](../07-auth-and-security.md#конфигурация-better-auth-ориентир).
Email пока в консоль (лог) — Unisender подключится в T-013, поэтому `requireEmailVerification`
временно false (включится в T-013).

## Что сделать
- [ ] `src/lib/auth.ts`: betterAuth c prismaAdapter, emailAndPassword, session 30 дней
- [ ] Смонтировать хэндлер: `app.on(['GET','POST'], '/api/v1/auth/*', (c) => auth.handler(c.req.raw))`
- [ ] Хук после регистрации: создать Company по полю company из тела (additional field)
- [ ] `sendVerificationEmail`/`sendResetPassword` — пока `logger.info(url)`
- [ ] env: BETTER_AUTH_SECRET, BETTER_AUTH_URL в env.ts и .env.example

## Затрагиваемые файлы
- `apps/api/src/lib/auth.ts` — создать
- `apps/api/src/app.ts`, `src/lib/env.ts`, `.env.example` — изменить

## Критерии приёмки
- [ ] `POST /api/v1/auth/sign-up/email` (name, email, password, company) → 200, в БД User + Company
- [ ] `POST /api/v1/auth/sign-in/email` → Set-Cookie; повторный запрос с кукой аутентифицирован
- [ ] Неверный пароль → ошибка без раскрытия существования email

## Как проверить
```bash
curl -i -X POST http://localhost:3000/api/v1/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","email":"t@t.ru","password":"12345678","company":"ООО Тест"}'
```
Затем sign-in и любой запрос с полученной кукой (`-b`).

## Подводные камни
Кастомное поле company — через `user.additionalFields` в конфиге Better Auth, иначе оно
отбросится. CORS: фронт с credentials — origin строго WEB_ORIGIN, не `*`.
