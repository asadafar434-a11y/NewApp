# 08 — Инфраструктура и деплой

## Окружения

| | local | staging | production |
|---|---|---|---|
| Где | машина разработчика | VPS, compose-стек `staging` | VPS, compose-стек `prod` |
| URL фронт | http://localhost:5173 | https://staging.ДОМЕН | https://app.ДОМЕН |
| URL API | http://localhost:3000 | https://staging.ДОМЕН/api | https://app.ДОМЕН/api |
| БД | Docker Postgres | Postgres в стеке staging | Postgres в стеке prod |
| Файлы | MinIO в Docker | S3 бакет `orbital-staging` | S3 бакет `orbital-prod` |
| Платежи | ЮKassa тестовый магазин | ЮKassa тестовый магазин | ЮKassa боевой |
| Email | консоль (лог) | Unisender Go, префикс [staging] | Unisender Go |
| Деплой | — | push в `main` (CI) | git-тег `v*` (CI) |

VPS: Timeweb Cloud, 4 vCPU / 8 ГБ / 100 ГБ NVMe, Ubuntu 24.04. Оба стека на одном VPS,
изоляция через compose-проекты и разные порты; Caddy один на хост.

## Переменные окружения

| Переменная | Пример | Описание |
|---|---|---|
| NODE_ENV | production | Режим |
| PORT | 3000 | Порт API |
| DATABASE_URL | postgresql://orbital:***@postgres:5432/orbital | Postgres |
| WEB_ORIGIN | https://app.example.ru | Origin фронта для CORS/CSRF |
| BETTER_AUTH_SECRET | (случайные 32+ байта) | Подпись сессий |
| BETTER_AUTH_URL | https://app.example.ru/api/v1/auth | Базовый URL auth |
| ANTHROPIC_API_KEY | sk-ant-*** | Claude API |
| ANTHROPIC_BASE_URL | https://api.anthropic.com | Переопределяется при использовании прокси |
| AI_MODEL | claude-sonnet-5 | Модель |
| AI_MONTHLY_TOKEN_LIMIT | 2000000 | Лимит токенов на компанию/мес |
| YOOKASSA_SHOP_ID | 123456 | Магазин ЮKassa |
| YOOKASSA_SECRET_KEY | live_*** | Ключ ЮKassa |
| PLATFORM_COMMISSION_PCT | 10 | Комиссия платформы, % |
| UNISENDER_GO_API_KEY | *** | Email |
| EMAIL_FROM | no-reply@example.ru | Отправитель |
| S3_ENDPOINT | https://s3.timeweb.cloud | S3 |
| S3_REGION | ru-1 | Регион |
| S3_BUCKET | orbital-prod | Бакет |
| S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY | *** | Ключи |
| SENTRY_DSN_API / VITE_SENTRY_DSN | https://***@sentry.io/1 | Sentry |
| VITE_API_URL | /api/v1 | База API для фронта |
| VITE_METRIKA_ID | 12345678 | Яндекс.Метрика |

`.env.example` в корне — все переменные с пустыми/фейковыми значениями и комментариями;
реальные значения только на VPS (`/opt/orbital/{staging,prod}/.env`) и в GitHub Secrets.

## docker-compose.yml (локальная разработка)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: orbital
      POSTGRES_PASSWORD: orbital
      POSTGRES_DB: orbital
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orbital"]
      interval: 5s
      retries: 5

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: orbital
      MINIO_ROOT_PASSWORD: orbital-local
    ports: ["9000:9000", "9001:9001"]
    volumes: [miniodata:/data]

volumes:
  pgdata:
  miniodata:
```

API и фронт локально запускаются не в Docker: `pnpm --filter api dev`, `pnpm --filter web dev`.

## Dockerfile (API)

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @orbital/api exec prisma generate \
 && pnpm --filter @orbital/shared build \
 && pnpm --filter @orbital/api build \
 && pnpm --filter @orbital/api deploy --prod /out

FROM node:22-alpine
WORKDIR /app
COPY --from=build /out .
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

Фронт собирается в CI (`vite build`) и кладётся в каталог, который раздаёт Caddy —
отдельный контейнер не нужен.

## Прод-стек на VPS (`/opt/orbital/prod/docker-compose.yml`)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env_file: .env
    environment:
      POSTGRES_USER: orbital
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: orbital
    volumes: [pgdata:/var/lib/postgresql/data]
    restart: unless-stopped

  api:
    image: ghcr.io/<GH_USER>/orbital-api:${TAG}
    env_file: .env
    depends_on: [postgres]
    ports: ["127.0.0.1:3000:3000"]
    restart: unless-stopped

volumes:
  pgdata:
```

Staging-стек аналогичен (порт 127.0.0.1:3001, свой volume и .env).

## Caddy (`/etc/caddy/Caddyfile`)

```caddy
app.example.ru {
    handle /api/* {
        reverse_proxy 127.0.0.1:3000
    }
    handle {
        root * /opt/orbital/prod/web
        try_files {path} /index.html
        file_server
    }
}

staging.example.ru {
    handle /api/* {
        reverse_proxy 127.0.0.1:3001
    }
    handle {
        root * /opt/orbital/staging/web
        try_files {path} /index.html
        file_server
    }
}
```

TLS автоматом (Let's Encrypt). SSE работает через reverse_proxy без доп. настроек
(Caddy не буферизует stream-ответы с `Content-Type: text/event-stream`).

## GitHub Actions

### CI — `.github/workflows/ci.yml` (на каждый PR и push в main)

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  ci:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_USER: orbital, POSTGRES_PASSWORD: orbital, POSTGRES_DB: orbital_test }
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U orbital" --health-interval 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm -r typecheck
      - run: pnpm -r lint
      - run: pnpm --filter @orbital/api exec prisma migrate deploy
        env: { DATABASE_URL: "postgresql://orbital:orbital@localhost:5432/orbital_test" }
      - run: pnpm -r test
        env: { DATABASE_URL: "postgresql://orbital:orbital@localhost:5432/orbital_test" }
      - run: pnpm -r build
```

### CD — `.github/workflows/deploy.yml`

```yaml
name: Deploy
on:
  push:
    branches: [main]       # → staging
    tags: ["v*"]           # → production
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: "${{ github.actor }}", password: "${{ secrets.GITHUB_TOKEN }}" }
      - uses: docker/build-push-action@v6
        with:
          file: apps/api/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/orbital-api:${{ github.ref_name }}
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile && pnpm --filter @orbital/web build
        env:
          VITE_API_URL: /api/v1
          VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
          VITE_METRIKA_ID: ${{ vars.METRIKA_ID }}
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            /opt/orbital/deploy.sh "${{ github.ref_name }}"
      - name: Copy web build
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "apps/web/dist/*"
          target: "/opt/orbital/${{ github.ref_type == 'tag' && 'prod' || 'staging' }}/web"
          strip_components: 3
```

`/opt/orbital/deploy.sh` на VPS: определяет стек по аргументу (тег → prod, main → staging),
пишет `TAG` в `.env`, `docker compose pull && docker compose up -d` (миграции запускает CMD
контейнера — `prisma migrate deploy` до старта приложения).

## Первый деплой — по шагам

1. Купить домен `.ru`, направить A-записи `app.` и `staging.` на IP VPS.
2. Создать VPS (Ubuntu 24.04), пользователя `deploy` c ключом, включить UFW (22, 80, 443).
3. Установить Docker + compose plugin + Caddy (apt), положить Caddyfile.
4. Создать `/opt/orbital/{staging,prod}` с compose-файлами и `.env` (по `.env.example`).
5. Создать бакеты S3 (`orbital-staging`, `orbital-prod`) и ключи.
6. GitHub Secrets: `VPS_HOST`, `VPS_SSH_KEY`, `VITE_SENTRY_DSN`; vars: `METRIKA_ID`.
7. Push в `main` → CI+CD разворачивают staging; проверить `https://staging.ДОМЕН/api/v1/health`.
8. Прогнать e2e по staging, затем `git tag v0.1.0 && git push --tags` → production.

## Миграции БД в проде

- Только `prisma migrate deploy` (никогда `migrate dev` вне local).
- Выполняется в CMD контейнера до старта API; при падении миграции контейнер не стартует,
  прежняя версия остаётся (compose не убивает старый контейнер до успешного нового — используем
  `docker compose up -d --wait`).
- Ломающие миграции — в две фазы (expand → migrate → contract), правило в [09-conventions.md](09-conventions.md).

## Бэкапы

- Cron на VPS (03:00 МСК): `pg_dump -Fc` обоих стеков → `aws s3 cp` в бакет `orbital-backups`
  (S3 РФ), имя `prod-YYYY-MM-DD.dump`; хранение 30 дней (lifecycle-политика бакета).
- Ежемесячная проверка: восстановить свежий дамп в temp-БД staging, убедиться что миграции
  и выборки работают (чек-лист в задаче T-048).

## Мониторинг

- `GET /api/v1/health` — проверка живости + пинг БД; внешний uptime-мониторинг
  (UptimeRobot free) на прод-URL.
- Sentry: ошибки API (middleware) и фронта (init в main.tsx), алерты на email.
- Логи: Pino JSON → stdout → `docker logs`; ротация настройкой Docker `max-size=50m, max-file=3`.
- Метрики: отложено до v2 (достаточно htop + Sentry + uptime на нашем масштабе).

## Стоимость в месяц (оценка)

| Статья | ₽/мес |
|---|---|
| VPS 4 vCPU / 8 ГБ (Timeweb) | ~2 500 |
| Домен .ru (амортизация) | ~60 |
| S3 (файлы + бэкапы, <50 ГБ) | ~150 |
| Unisender Go (до 1000 писем) | ~600 |
| Claude API (лимиты по компаниям) | 5 000–10 000 |
| Sentry, UptimeRobot, Метрика | 0 (free tier) |
| **Итого** | **~8 300–13 300** (в бюджете ≤15 000) |

Главный рычаг затрат — AI_MONTHLY_TOKEN_LIMIT: понижение лимита напрямую режет расходы.
