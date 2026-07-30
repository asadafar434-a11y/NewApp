# T-015: Фронт — TanStack Query, api-клиент, реальный Auth

**Фаза:** 2 · **Оценка:** 4ч · **Зависит от:** T-012 · **Статус:** todo

## Цель
Формы /auth регистрируют и логинят через реальный API; сессия переживает перезагрузку страницы.

## Контекст
Слой данных — [06-frontend.md](../06-frontend.md#слой-данных-tanstack-query). AuthContext
сохраняет интерфейс `{ user, login, signup, logout }` — страницы не меняются.

## Что сделать
- [ ] deps web: `@tanstack/react-query`, `better-auth` (client); обернуть App в QueryClientProvider
- [ ] `src/api/client.ts`: fetch-обёртка (baseUrl VITE_API_URL, credentials:'include', парсинг errorResponse, 401 → redirect /auth)
- [ ] `src/api/queryKeys.ts` — фабрика ключей из 06-frontend.md
- [ ] `src/lib/authClient.ts`: createAuthClient Better Auth (baseURL /api/v1/auth)
- [ ] `AuthContext.tsx`: user из `authClient.useSession()`; login/signup/logout → authClient; поле company при signup
- [ ] `Auth.tsx`: показ реальных ошибок (email занят, короткий пароль) по-русски
- [ ] Vite dev proxy: `/api` → `http://localhost:3000` (vite.config)

## Затрагиваемые файлы
- `apps/web/src/api/client.ts`, `queryKeys.ts`, `src/lib/authClient.ts` — создать
- `apps/web/src/context/AuthContext.tsx`, `src/pages/Auth.tsx`, `src/App.tsx`, `vite.config.ts` — изменить

## Критерии приёмки
- [ ] Регистрация из UI создаёт User+Company (видно в Studio)
- [ ] После F5 пользователь остаётся залогинен; logout разлогинивает
- [ ] Ошибка «email уже занят» отображается в форме

## Как проверить
Открыть :5173/auth, зарегистрироваться, F5, выйти, войти снова.

## Подводные камни
Кука не ставится без proxy/одинакового origin — в dev обязателен vite proxy. `user.company` —
кастомное поле: убедиться, что session-ответ его содержит (inferAdditionalFields на клиенте).
