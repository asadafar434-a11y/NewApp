# T-001: Монорепо pnpm — фронт переезжает в apps/web

**Фаза:** 0 · **Оценка:** 3ч · **Зависит от:** — · **Статус:** done

## Цель
Репозиторий стал pnpm-монорепо; существующий фронт живёт в `apps/web` и запускается как раньше.

## Контекст
Сейчас фронт лежит в корне (src/, vite.config.ts, index.html). Целевая структура — в
[03-architecture.md](../03-architecture.md#монорепозиторий).

## Что сделать
- [ ] В корне: `pnpm-workspace.yaml` с `packages: ["apps/*", "packages/*"]`
- [ ] Создать `apps/web`, перенести туда `src/`, `index.html`, `vite.config.ts`, `tsconfig.json`
- [ ] `apps/web/package.json`: name `@orbital/web`, перенести dependencies фронта из корневого
- [ ] Корневой `package.json`: только workspace-скрипты (`dev`, `build`, `typecheck` через `pnpm -r`) и devDeps общего назначения
- [ ] Корневой `tsconfig.base.json` (strict: true), `apps/web/tsconfig.json` наследует
- [ ] `pnpm install`, убрать старый lock при конфликте

## Затрагиваемые файлы
- `pnpm-workspace.yaml` — создать
- `apps/web/**` — перенос текущего фронта
- `package.json`, `tsconfig.base.json` — переписать/создать

## Критерии приёмки
- [ ] `pnpm --filter @orbital/web dev` открывает приложение, все страницы работают как раньше
- [ ] `pnpm -r build` собирается без ошибок
- [ ] В корне не осталось `src/` и `vite.config.ts`

## Как проверить
```bash
pnpm install
pnpm --filter @orbital/web dev
```
Открыть http://localhost:5173, пройтись по всем разделам.

## Подводные камни
Пути в `vite.config.ts` и `index.html` (`/src/main.tsx`) — проверить после переноса.
Figma Make может ожидать файлы в корне — если превью сломается, оставить корневой
`index.html`-прокси не нужно, работать через обычный dev-сервер.
