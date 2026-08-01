# T-010: Схема остальных доменов

**Фаза:** 1 · **Оценка:** 3ч · **Зависит от:** T-009 · **Статус:** done

## Цель
Полная схема: Payment, FinanceRecord, Campaign, OpsTask/OpsRun, AiTask/AiMessage, TokenUsage,
Notification, AnalyticsEvent — миграция применена, схема совпадает с 04-data-model.md.

## Что сделать
- [ ] Перенести оставшиеся модели/enum из [04-data-model.md](../04-data-model.md)
- [ ] `npx prisma migrate dev --name payments_finance_ops_ai`
- [ ] Сверить итоговую schema.prisma с документом (diff глазами); расхождения — поправить документ

## Затрагиваемые файлы
- `apps/api/prisma/schema.prisma` — изменить
- `docs/04-data-model.md` — при расхождениях

## Критерии приёмки
- [ ] Все таблицы на месте (`\dt` в psql — ~20 таблиц)
- [ ] `@@unique([companyId, month])` в TokenUsage работает (дубликат падает)
- [ ] `Payment.requestId` c `onDelete: Restrict`: удаление Request с платежом падает на уровне БД

## Как проверить
```bash
pnpm --filter @orbital/api exec prisma migrate dev
docker compose exec postgres psql -U orbital -c "\dt"
```

## Подводные камни
`Json @default("{}")` — синтаксис со строкой. Restrict на Payment означает: приложение обязано
запрещать удаление consult-заявок с платежами до попытки БД (сервисная проверка в T-033).
