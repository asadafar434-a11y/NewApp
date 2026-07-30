# T-038: Marketing — кампании и реальные графики

**Фаза:** 4 · **Оценка:** 4ч · **Зависит от:** T-016 · **Статус:** todo

## Цель
Кампании вносятся вручную; KPI, графики и таблица Marketing — из БД.

## Контекст
Полный аналог T-036 для кампаний. Модель Campaign — [04-data-model.md](../04-data-model.md);
замены — [06-frontend.md](../06-frontend.md) (строка Marketing.tsx).

## Что сделать
- [ ] shared: `schemas/campaign.ts` (create/update/entity)
- [ ] API: campaigns routes/service/repo (GET, POST, PATCH, DELETE hard)
- [ ] Фронт: `api/marketing.ts`; Marketing.tsx — CAMPAIGNS/CAMPAIGN_DATA → useCampaigns; KPI (показы, клики, конверсии, ROAS = выручка-поле не храним → ROAS считать как conversions*средний чек? нет — считать CPL и CTR из имеющихся полей, ROAS убрать из KPI и таблицы, заменить на CTR) — **упрощение зафиксировать в 06-frontend.md**
- [ ] Модалка «Добавить кампанию» (название, канал, период, бюджет ₽, показы, клики, конверсии, статус) + правка/удаление из таблицы
- [ ] Vitest: CRUD + изоляция

## Затрагиваемые файлы
- `packages/shared/src/schemas/campaign.ts`, `apps/api/src/{routes,services,repositories}/campaigns.*` — создать
- `apps/web/src/api/marketing.ts` — создать; `src/pages/Marketing.tsx` — изменить; `docs/06-frontend.md` — пометка про CTR/ROAS

## Критерии приёмки
- [ ] Сиды дают графики; новая кампания появляется в таблице и графиках
- [ ] CPL = spend/conversions, CTR = clicks/impressions — считаются на лету, деление на 0 не ломает UI
- [ ] Тесты зелёные

## Как проверить
UI: добавить кампанию с 1000 показов/50 кликов → CTR 5% в таблице; F5.

## Подводные камни
Недельные графики из моков заменяются помесячными/по кампаниям (реальных недельных данных нет) —
допустимое отклонение от исходного вида, сохранить стиль.
