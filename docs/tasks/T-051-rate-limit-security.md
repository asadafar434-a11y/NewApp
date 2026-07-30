# T-051: Rate limiting и финальная проверка безопасности

**Фаза:** 6 · **Оценка:** 3ч · **Зависит от:** T-047 · **Статус:** todo

## Цель
Лимиты из 05-api.md работают; чек-лист безопасности из 07 пройден по пунктам.

## Что сделать
- [ ] `src/middleware/rate-limit.ts`: in-memory (Map + окно): фабрика `rateLimit({keyFn, limit, windowMs})`; повесить: auth 10/мин на IP, AI 20/мин на компанию, public-чат 30/мин на токен, остальное 300/мин на сессию; 429 RATE_LIMITED c Retry-After
- [ ] Пройти чек-лист [07-auth-and-security.md](../07-auth-and-security.md#безопасность) построчно, отметить в этом файле
- [ ] Проверить Origin-check на мутациях (CSRF), secureHeaders, отсутствие стектрейсов в прод-ответах
- [ ] Vitest: превышение лимита → 429; окно сбрасывается
- [ ] Ручной тест: 15 неверных паролей подряд → 429

## Затрагиваемые файлы
- `apps/api/src/middleware/rate-limit.ts` — создать
- `apps/api/src/app.ts` — подключение

## Критерии приёмки
- [ ] curl-циклы упираются в 429 на каждом классе эндпоинтов
- [ ] Чек-лист 07 полностью отмечен (или расхождения превращены в задачи)

## Как проверить
```bash
for i in $(seq 1 15); do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://staging.ДОМЕН/api/v1/auth/sign-in/email -H "Content-Type: application/json" -d '{"email":"x@x.ru","password":"wrong"}'; done
```

## Подводные камни
IP за Caddy — брать из X-Forwarded-For (Caddy проставляет; доверять только своему прокси).
In-memory лимиты обнуляются рестартом — приемлемо (ADR-0005 логика та же).
