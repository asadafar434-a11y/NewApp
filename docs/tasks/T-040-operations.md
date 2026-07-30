# T-040: Operations — задачи и AI-запуск

**Фаза:** 4 · **Оценка:** 4ч · **Зависит от:** T-028 · **Статус:** todo

## Цель
Ops-задачи создаются в UI; ▶ запускает реальный AI-«прогон» с отчётом; история запусков видна.

## Контекст
Модели OpsTask/OpsRun — [04-data-model.md](../04-data-model.md); в v1 запуск = AI-отчёт,
внешних действий нет ([02-requirements.md](../02-requirements.md), FR-23, FR-27).

## Что сделать
- [ ] shared: `schemas/ops.ts`
- [ ] API: ops routes/service/repo — CRUD задач (soft-delete); POST /:id/run: OpsRun(running) + статус задачи running → completeJson (описание задачи + контекст компании → отчёт markdown) → OpsRun done + report, задача done/lastRunAt; ошибка AI → failed
- [ ] GET /:id/runs — история
- [ ] Фронт: `api/ops.ts`; Operations.tsx — TASKS → useOpsTasks; ▶ → мутация run (спиннер как сейчас, но реальный); модалка создания/правки; клик по задаче → история запусков с отчётами (разворачиваемые)
- [ ] KPI_ITEMS: прогресс-бары → счётчики из данных (выполнено запусков за месяц и т.п.) — упрощённо
- [ ] Vitest: run создаёт OpsRun и меняет статусы; ошибка AI → failed (мок)

## Затрагиваемые файлы
- `packages/shared/src/schemas/ops.ts`, `apps/api/src/{routes,services,repositories}/ops.*` — создать
- `apps/web/src/api/ops.ts` — создать; `src/pages/Operations.tsx` — изменить

## Критерии приёмки
- [ ] Создание задачи «Еженедельный отчёт по продажам» → ▶ → через ~10 с отчёт в истории
- [ ] Статусы running/done видны в реальном времени (поллинг мутации достаточен)
- [ ] Тесты зелёные

## Как проверить
UI-цикл + Studio (OpsRun с report).

## Подводные камни
Запуск дольше HTTP-таймаута не бывает (один AI-вызов), но кнопку дизейблить при running —
повторный run параллельно → 409.
