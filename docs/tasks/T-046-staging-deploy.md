# T-046: Staging — стек и CD по push в main

**Фаза:** 5 · **Оценка:** 4ч · **Зависит от:** T-045 · **Статус:** todo

## Цель
Push в main автоматически разворачивает staging; приложение целиком работает на staging.ДОМЕН.

## Контекст
Compose-стек, deploy.yml и deploy.sh — [08-infrastructure.md](../08-infrastructure.md).
Внешние сервисы staging: тестовый магазин ЮKassa, боевой Unisender (префикс [staging] в темах),
бакет orbital-staging, свой SENTRY_DSN.

## Что сделать
- [ ] Создать S3-бакеты (staging + backups) у РФ-провайдера; ключи
- [ ] `/opt/orbital/staging/`: docker-compose.yml (порт 3001) + .env со staging-значениями
- [ ] `/opt/orbital/deploy.sh` (аргумент = ref: main → staging, v* → prod; TAG в .env; pull; up -d --wait)
- [ ] `.github/workflows/deploy.yml` из 08-infrastructure.md; secrets: VPS_HOST, VPS_SSH_KEY, VITE_SENTRY_DSN; vars: METRIKA_ID
- [ ] Caddyfile: staging-блок с reverse_proxy 127.0.0.1:3001
- [ ] Вебхук ЮKassa (тестовый магазин) → `https://staging.ДОМЕН/api/v1/webhooks/yookassa`
- [ ] Прогнать сиды на staging-БД

## Затрагиваемые файлы
- `.github/workflows/deploy.yml` — создать
- VPS: compose, .env, deploy.sh, Caddyfile

## Критерии приёмки
- [ ] Push в main → Actions зелёный → staging.ДОМЕН работает: регистрация с реальным письмом, golden path, тестовая оплата с автоматическим вебхуком
- [ ] `docker compose logs api` на VPS показывает Pino-логи без ошибок

## Как проверить
Мелкий коммит в main → пройти руками ключевой сценарий на staging.

## Подводные камни
ghcr.io приватный образ: на VPS `docker login ghcr.io` от deploy (PAT read:packages) один раз.
SSE через Caddy — проверить чат (flush_interval по умолчанию ок для event-stream).
