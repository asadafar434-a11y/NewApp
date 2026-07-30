# T-016: Защита роутов, /me, verify-email и reset-password экраны

**Фаза:** 2 · **Оценка:** 3ч · **Зависит от:** T-013, T-015 · **Статус:** todo

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
- [ ] Без куки `GET /me` → 401; фронт уводит на /auth
- [ ] Неподтверждённый пользователь после логина попадает на /verify-email и не может уйти в разделы
- [ ] Полный сброс пароля из UI работает

## Как проверить
Инкогнито-окно: регистрация → /verify-email → подтвердить по ссылке из лога → дашборд.
Затем «забыл пароль» с /auth.

## Подводные камни
Better Auth session-check на каждый запрос — использовать cookieCache (уже в конфиге), иначе
каждый API-вызов ходит в БД за сессией.
