# T-049: Sentry

**Фаза:** 5 · **Оценка:** 2ч · **Зависит от:** T-046 · **Статус:** todo

## Цель
Ошибки API и фронта прилетают в Sentry с окружением и релизом; алерт на email работает.

## Что сделать
- [ ] Sentry-проект x2 (api, web) или один с платформами; DSN в env обоих окружений
- [ ] API: `@sentry/node` — init в index.ts (environment, release=TAG); захват в error-handler (5xx и необработанные); фильтр: 4xx не слать
- [ ] Web: `@sentry/react` — init в main.tsx только при VITE_SENTRY_DSN; ErrorBoundary вокруг Router с фолбэк-экраном «Что-то пошло не так»
- [ ] Скрабинг: beforeSend вычищает email/телефоны из событий
- [ ] Алерт-правило: новая ошибка → email
- [ ] Проверка: тестовый роут `/api/v1/test/boom` (только staging) и кнопка-краш в dev

## Затрагиваемые файлы
- `apps/api/src/index.ts`, `src/middleware/error-handler.ts` — изменить
- `apps/web/src/main.tsx` — изменить

## Критерии приёмки
- [ ] Ошибка на staging видна в Sentry с environment=staging и стектрейсом
- [ ] Фронт-краш показывает фолбэк и попадает в Sentry
- [ ] Письмо-алерт пришло

## Как проверить
Дёрнуть boom-роут на staging; проверить Sentry и почту.

## Подводные камни
Sourcemaps фронта: залить в Sentry на CI-шаге build (иначе стектрейсы минифицированы) —
`@sentry/vite-plugin` c auth-токеном в secrets. Не слать события из local (без DSN в dev).
