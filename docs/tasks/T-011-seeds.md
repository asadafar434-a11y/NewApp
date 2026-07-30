# T-011: Сиды — демо-данные из моков UI

**Фаза:** 1 · **Оценка:** 3ч · **Зависит от:** T-010 · **Статус:** todo

## Цель
`prisma db seed` наполняет БД демо-компанией с данными, повторяющими текущие моки UI.

## Контекст
Моки лежат в существующих страницах: `ALL_CANDIDATES` (Hiring.tsx), `INITIAL_CONVERSATIONS`
(Messages.tsx), `REVENUE_DATA`/`EXPENSE_DATA`/`ISSUES` (Finance.tsx), `CAMPAIGNS` (Marketing.tsx),
`TASKS` (Operations.tsx, Dashboard.tsx). Их перенос — [06-frontend.md](../06-frontend.md),
последний абзац.

## Что сделать
- [ ] `prisma/seed.ts` + конфиг `"prisma": { "seed": "tsx prisma/seed.ts" }`
- [ ] Демо-пользователь `demo@orbital.ru` (emailVerified=true) + Company «Acme Corp»
- [ ] 2 заявки (hire «Продуктовый дизайнер», consult «Консультация по налогам», цена 500000 коп.)
- [ ] 5 специалистов из ALL_CANDIDATES (статусы разные), привязать к заявкам
- [ ] Диалоги и сообщения из INITIAL_CONVERSATIONS
- [ ] FinanceRecord из REVENUE_DATA/EXPENSE_DATA (помесячно, копейки!), кампании, ops-задачи
- [ ] Сид идемпотентен: `upsert` или полная очистка демо-компании перед вставкой

## Затрагиваемые файлы
- `apps/api/prisma/seed.ts` — создать
- `apps/api/package.json` — конфиг seed

## Критерии приёмки
- [ ] `pnpm --filter @orbital/api exec prisma db seed` дважды подряд — без ошибок и дублей
- [ ] В Studio: специалисты с русскими именами, сообщения в диалогах, финансы за 6+ месяцев

## Как проверить
```bash
pnpm --filter @orbital/api exec prisma db seed
pnpm --filter @orbital/api exec prisma studio
```

## Подводные камни
Пароль демо-пользователя должен быть захэширован так, как ждёт Better Auth — проще всего
создать пользователя через auth API после T-012 и обновить сид; до тех пор — пользователь
без Account-записи (вход невозможен, данные видны).
Суммы: рубли из моков × 100 → копейки.
