# T-009: Схема ядра — заявки, специалисты, чат, звонки

**Фаза:** 1 · **Оценка:** 3ч · **Зависит от:** T-008 · **Статус:** done

## Цель
Миграция создаёт Request, Specialist, StatusChange, SpecialistAccessToken, Conversation,
Message, ScheduledCall со всеми enum, индексами и каскадами.

## Контекст
Скопировать соответствующие модели из [04-data-model.md](../04-data-model.md) — схема готова
целиком. Каскады описаны в разделе «Каскады удаления».

## Что сделать
- [ ] Перенести модели и enum в schema.prisma
- [ ] `npx prisma migrate dev --name core_domain`
- [ ] Мини-скрипт-проверка (или Prisma Studio): создать руками Request → Specialist → Conversation → Message

## Затрагиваемые файлы
- `apps/api/prisma/schema.prisma` — изменить

## Критерии приёмки
- [ ] Миграция применяется; в SQL миграции видны индексы `Specialist_companyId_status_idx` и т.д.
- [ ] Удаление Specialist в Studio каскадно удаляет его Conversation/Message (проверить руками)
- [ ] Уникальность `Conversation.specialistId` работает (вторая вставка падает)

## Как проверить
```bash
pnpm --filter @orbital/api exec prisma migrate dev
pnpm --filter @orbital/api exec prisma studio
```

## Подводные камни
`String[]` (skills) — нативный массив Postgres, в SQLite не работал бы — мы на Postgres, ок.
Enum-переименования в будущем болезненны — имена статусов финальные (согласованы в ADR-0006).
