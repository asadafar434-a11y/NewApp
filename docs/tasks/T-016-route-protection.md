# T-016: Защита роутов, /me, verify-email и reset-password экраны

**Фаза:** 2 · **Оценка:** 3ч · **Зависит от:** T-013, T-015 · **Статус:** done

## Цель
Неавторизованный видит только /auth; неподтверждённый — /verify-email; сброс пароля работает из UI.

## Контекст
Auth-middleware API кладёт `ctx { userId, companyId, role }` — его используют ВСЕ последующие
задачи. [07-auth-and-security.md](../07-auth-and-security.md#матрица-прав).

## Что сделать
- [ ] API `src/middleware/auth.ts`: сессия из Better Auth → ctx; нет сессии → 401; emailVerified=false → 403 EMAIL_NOT_VERIFIED; company soft-deleted → 403
- [ ] API `GET /me`: user + company (routes/me.routes.ts, первый «настоящий» защищённый роут)
- [ ] Фронт: страница `/verify-email` (текст + кнопка «отправить повторно»), `/reset-password` (2 шага: запрос и новый пароль по токену из URL)
- [ ] `routes.tsx`: новые публичные роуты; Root уже редиректит на /auth — добавить редирект на /verify-email по флагу из сессии
- [ ] client.ts: обработка EMAIL_NOT_VERIFIED → navigate /verify-email

## Затрагиваемые файлы
- `apps/api/src/middleware/auth.ts`, `src/routes/me.routes.ts` — создать
- `apps/web/src/pages/VerifyEmail.tsx`, `ResetPassword.tsx` — создать
- `apps/web/src/routes.tsx`, `src/api/client.ts` — изменить

## Критерии приёмки
- [x] Без куки `GET /me` → 401; фронт уводит на /auth
- [x] Неподтверждённый пользователь с сессией попадает на /verify-email и не может уйти в разделы —
      **уточнение**: обычный вход (`sign-in`) для неподтверждённого email better-auth блокирует
      ЕЩЁ ДО выдачи сессии (403 EMAIL_NOT_VERIFIED без Set-Cookie, подтверждено в T-013/здесь) —
      Auth.tsx показывает эту ошибку инлайн, редирект на /verify-email в обычном флоу не наступает.
      Сама защита (Root.tsx + requireAuth) проверена вручную: сессия неподтверждённого
      пользователя создана напрямую в БД (в обход sign-in) и подписана той же HMAC-формулой,
      что и better-auth — с такой кукой `/` и `/hiring` корректно уводят на /verify-email,
      а `GET /me` отдаёт 403. Живой сценарий из "Как проверить" (регистрация → письмо →
      подтверждение → дашборд) пройден полностью через настоящий signup, не через эту сессию.
- [x] Полный сброс пароля из UI работает

## Как проверить
Инкогнито-окно: регистрация → /verify-email → подтвердить по ссылке из лога → дашборд.
Затем «забыл пароль» с /auth.

## Подводные камни
Better Auth session-check на каждый запрос — использовать cookieCache (уже в конфиге), иначе
каждый API-вызов ходит в БД за сессией.

**Найдено в процессе:** ссылки в письмах (`signUp.email`, `sendVerificationEmail`) без явного
`callbackURL` резолвятся better-auth относительно origin API (BETTER_AUTH_URL), а не фронта. В
dev API (`:3000`) и фронт (`:8443`) — разные origin, поэтому ссылка из письма уводила на голый
API вместо приложения. Исправлено передачей `callbackURL: window.location.origin + '/'`
явно при вызове signUp/sendVerificationEmail (AuthContext.tsx, VerifyEmail.tsx). В production
это осталось бы незамеченным, т.к. там API и фронт на одном домене (docs/08-infrastructure.md).
