# T-008: Схема Better Auth + Company

**Фаза:** 1 · **Оценка:** 2ч · **Зависит от:** T-007 · **Статус:** done

## Цель
В БД есть таблицы user/session/account/verification и Company; миграция применена.

## Контекст
Схема — [04-data-model.md](../04-data-model.md#prisma-схема-готова-к-копированию), разделы
Better Auth и Company. **Важно:** сгенерировать актуальные auth-модели CLI-командой Better Auth
(`npx @better-auth/cli generate`) и сверить с документом — приоритет у CLI (открытый вопрос в 04).

## Что сделать
- [ ] Установить `better-auth` в api (нужен для CLI-генерации схемы)
- [ ] Сгенерировать/скопировать модели User, Session, Account, Verification; добавить поле `role`
- [ ] Добавить модель Company (+ relation User.company)
- [ ] `npx prisma migrate dev --name auth_and_company`
- [ ] Обновить 04-data-model.md, если CLI-схема разошлась с документом

## Затрагиваемые файлы
- `apps/api/prisma/schema.prisma` — изменить
- `apps/api/prisma/migrations/**` — создастся

## Критерии приёмки
- [ ] `npx prisma migrate dev` без ошибок; `npx prisma studio` показывает 5 таблиц
- [ ] `pnpm -r typecheck` зелёный (клиент перегенерирован)

## Как проверить
```bash
pnpm --filter @orbital/api exec prisma migrate dev
pnpm --filter @orbital/api exec prisma studio
```

## Подводные камни
Better Auth ожидает точные имена таблиц/колонок — маппинги `@@map` не менять после генерации.
Поле `role` — наше расширение, Better Auth его не трогает.
