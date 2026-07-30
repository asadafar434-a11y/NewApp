# T-004: Docker Compose — Postgres и MinIO локально

**Фаза:** 0 · **Оценка:** 2ч · **Зависит от:** — · **Статус:** todo

## Цель
`docker compose up -d` поднимает Postgres 16 и MinIO; данные переживают перезапуск.

## Контекст
Compose-файл целиком приведён в [08-infrastructure.md](../08-infrastructure.md#docker-composeyml-локальная-разработка).

## Что сделать
- [ ] Установить Docker Desktop (Windows) если нет
- [ ] Скопировать docker-compose.yml из 08-infrastructure.md в корень
- [ ] `.env.example` в корне: DATABASE_URL и S3_* для локали (значения local-стека)
- [ ] Создать бакет `orbital-local` через консоль MinIO (localhost:9001)

## Затрагиваемые файлы
- `docker-compose.yml` — создать
- `.env.example` — создать

## Критерии приёмки
- [ ] `docker compose ps` — оба сервиса healthy/running
- [ ] `psql postgresql://orbital:orbital@localhost:5432/orbital -c "select 1"` работает (или через Docker: `docker compose exec postgres psql -U orbital -c "select 1"`)
- [ ] Консоль MinIO доступна, бакет создан
- [ ] После `docker compose restart` данные на месте

## Как проверить
```bash
docker compose up -d
docker compose ps
docker compose exec postgres psql -U orbital -c "select 1"
```

## Подводные камни
Занятый порт 5432 (локальный Postgres из других проектов) — поменять маппинг на 5433 и отразить
в DATABASE_URL. На Windows WSL2-бэкенд Docker обязателен.
