# T-033: ЮKassa — создание платежа

**Фаза:** 4 · **Оценка:** 4ч · **Зависит от:** T-018 · **Статус:** todo

## Цель
`POST /payments` создаёт платёж в тестовом магазине ЮKassa и возвращает confirmationUrl.

## Контекст
[ADR-0003](../adr/ADR-0003-yookassa-payments.md): цена — из Request.priceKopecks, клиент цену
не передаёт. Тестовый магазин: завести в ЛК ЮKassa (shopId + secretKey теста).

## Что сделать
- [ ] env: YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, PLATFORM_COMMISSION_PCT
- [ ] `src/lib/payments/index.ts`: `createPayment({amountKopecks, description, returnUrl, idempotenceKey})` → POST api.yookassa.ru/v3/payments (Basic auth, Idempotence-Key header); `getPayment(id)`
- [ ] shared: `schemas/payment.ts`
- [ ] `payments.service.ts` create: заявка компании? type=consult? нет уже succeeded/pending платежа? → запись Payment (pending, commissionPct из env) → createPayment (receipt с email владельца для чека) → сохранить yookassaId/confirmationUrl
- [ ] Роуты: POST /payments, GET /payments
- [ ] Vitest: правила (hire-заявка → 400; повторный pending → 409); lib/payments замокан

## Затрагиваемые файлы
- `apps/api/src/lib/payments/**`, `src/{routes,services,repositories}/payments.*`,
  `packages/shared/src/schemas/payment.ts` — создать

## Критерии приёмки
- [ ] curl POST /payments с consult-заявкой → confirmationUrl открывается, тестовая карта ЮKassa (`5555 5555 5555 4477`) проходит оплату
- [ ] Payment в БД: pending, верные amount/commission
- [ ] Тесты зелёные

## Как проверить
curl → открыть confirmationUrl → оплатить тестовой картой (статус подтянется в T-034).

## Подводные камни
Idempotence-Key обязателен (uuid по id нашей записи Payment). Сумма в ЮKassa — строка рублей
с копейками ("5000.00") — конвертация из kopecks аккуратно. Чек (receipt) обязателен при
включённой фискализации — items с описанием консультации.
