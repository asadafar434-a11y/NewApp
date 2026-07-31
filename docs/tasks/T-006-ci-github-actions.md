# T-006: CI — GitHub Actions

**Фаза:** 0 · **Оценка:** 3ч · **Зависит от:** T-005 · **Статус:** done

## Цель
Каждый PR и push в main прогоняет typecheck, lint, tests, build; красный CI блокирует мерж.

## Контекст
Workflow целиком — [08-infrastructure.md](../08-infrastructure.md#ci--githubworkflowsciyml-на-каждый-pr-и-push-в-main).
Prisma-шаги из workflow добавятся в T-007 — сейчас закомментировать.

## Что сделать
- [ ] Скрипты в корне: `typecheck: pnpm -r typecheck`, `lint: pnpm -r lint` (lint пока = oxfmt --check), `test: pnpm -r test`
- [ ] `.github/workflows/ci.yml` из 08-infrastructure.md (без prisma-шагов)
- [ ] В GitHub: Settings → Branches → защита main (require PR, require CI)
- [ ] Проверить на тестовом PR

## Затрагиваемые файлы
- `.github/workflows/ci.yml` — создать
- `package.json` — скрипты

## Критерии приёмки
- [ ] PR с намеренной ошибкой типов — CI красный
- [ ] После фикса — зелёный, мерж доступен

## Как проверить
Создать ветку, сломать тип, открыть PR, посмотреть Actions; починить, увидеть зелёный.

## Подводные камни
pnpm-кэш в setup-node требует `packageManager` поле в корневом package.json
(`"packageManager": "pnpm@9.x"`). oxfmt в CI: убедиться что он проверяет, а не переписывает.
