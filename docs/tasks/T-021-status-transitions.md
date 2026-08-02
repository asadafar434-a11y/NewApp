# T-021: Статусы специалиста — валидатор переходов + таймлайн

**Фаза:** 3 · **Оценка:** 3ч · **Зависит от:** T-020 · **Статус:** done

## Цель
Смена статуса валидируется по типу заявки, пишется в лог и показывается таймлайном в профиле.

## Контекст
Допустимые переходы — [ADR-0006](../adr/ADR-0006-unified-request.md). Эндпоинт
`POST /specialists/:id/status` — [05-api.md](../05-api.md).

## Что сделать
- [x] `services/specialists.service.ts`: карта переходов `{hire: {...}, consult: {...}}`; `changeStatus` в транзакции: update + StatusChange
- [x] Недопустимый переход → 400 VALIDATION с сообщением «Нельзя перевести из X в Y»
- [x] GET специалиста отдаёт statusChanges (уже в T-019) — фронт: таймлайн в CandidateDetail (существующая стилистика, mono-шрифт дат)
- [x] Кнопки статусов в UI показывают только допустимые следующие статусы
- [x] Vitest: все допустимые цепочки hire и consult; запрещённые (new → hired) → 400

## Затрагиваемые файлы
- `apps/api/src/repositories/specialists.repo.ts` — добавлены `getStatusContext` и `changeStatus`
  (с оптимистичной блокировкой по `fromStatus` в `where`, транзакция update + StatusChange)
- `apps/api/src/services/specialists.service.ts` — изменён: карта `STATUS_TRANSITIONS`,
  `STATUS_LABELS` для читаемых сообщений об ошибке, метод `changeStatus`
- `apps/api/src/routes/specialists.routes.ts` — добавлен `POST /specialists/:id/status`
- `apps/api/test/specialists.test.ts` — 6 новых тестов
- `apps/web/src/api/specialists.ts` — добавлен `useChangeSpecialistStatus`
- `apps/web/src/pages/Hiring.tsx` (CandidateDetail) — изменён: пилюли статуса заменены на
  текущий статус + кнопки допустимых переходов (`STATUS_TRANSITIONS`, зеркало бэкенда для UX);
  добавлена секция «Таймлайн» со статус-логом

## Критерии приёмки
- [x] hire-специалист проходит new→contacted→scheduled→interviewed→hired; consult — свой цикл
  — проверено и автотестами, и вживую в браузере (полная цепочка hire, таймлайн с датами)
- [x] Прямой curl с недопустимым статусом → 400 — проверено на new→hired
  (`"Нельзя перевести из «Новый» в «Нанят»"`) и на переходе из финального `hired`
- [x] Таймлайн отображает историю с датами — подтверждено вживую, mono-шрифт дат/времени

## Как проверить
UI-цепочка + `curl -X POST .../status -d '{"status":"hired"}'` из состояния new → 400.

## Подводные камни
`rejected` доступен из любого нефинального статуса обоих циклов. Транзакция обязательна —
иначе рассинхрон статуса и лога.

## Находки
- Оптимистичная блокировка: `changeStatus` в репозитории кладёт `status: fromStatus` в
  `where` у `updateMany` — если между проверкой в сервисе и записью статус успел уйти дальше
  (гонка двух параллельных запросов), `count === 0` и сервис возвращает 409 CONFLICT вместо
  тихой записи неверного StatusChange.
- На фронте `STATUS_TRANSITIONS` продублирована как зеркало бэкенда исключительно для UX
  (не показывать заведомо недопустимые кнопки) — сервер остаётся единственным источником
  истины и валидирует независимо.
