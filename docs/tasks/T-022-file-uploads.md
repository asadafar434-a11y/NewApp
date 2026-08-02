# T-022: Файлы — presigned upload резюме и аватаров

**Фаза:** 3 · **Оценка:** 4ч · **Зависит от:** T-019 · **Статус:** done

## Цель
В форме специалиста загружаются PDF-резюме и аватар; файлы лежат в S3/MinIO, открываются из профиля.

## Контекст
`POST /uploads/presign` — [05-api.md](../05-api.md); ограничения — [07-auth-and-security.md](../07-auth-and-security.md#безопасность)
(строка «Файлы»). Локально — MinIO из T-004.

## Что сделать
- [x] `src/lib/storage/index.ts`: S3-клиент (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`); `presignUpload(companyId, kind, contentType, sizeBytes)` → `{ url, key }`; `presignDownload(key)`; ключи `companies/{companyId}/{kind}/{cuid}.{ext}`
- [x] Роут presign: kind `resume|avatar`; resume → только application/pdf, avatar → image/jpeg|png|webp; лимит 10 МБ в policy
- [x] Фронт: в форме специалиста input file → presign → PUT в S3 → key в resumeKey/avatarKey
- [x] Профиль: кнопка «Резюме (PDF)» → presignDownload → открыть; аватар — картинкой
- [x] Vitest: presign с чужим companyId невозможен (companyId из ctx), недопустимый contentType → 400

## Затрагиваемые файлы
- `apps/api/src/lib/storage/index.ts`, `src/routes/uploads.routes.ts` — созданы
- `apps/api/src/routes/specialists.routes.ts`, `services/specialists.service.ts` — добавлен
  `GET /specialists/:id/files/:kind` (302-редирект на presigned URL — ключи не выдаются напрямую)
- `apps/web/src/api/uploads.ts` (создан), `src/pages/Hiring.tsx` (`FileUploadField`,
  аватар в `CandidateCard`/`CandidateDetail`, кнопка «Резюме (PDF)») — изменены/созданы
- `.github/workflows/ci.yml` — добавлен шаг `docker run` для MinIO (см. находки ниже)

## Критерии приёмки
- [x] PDF загружается и открывается из профиля; аватар отображается в списке и деталях —
  проверено вживую (загрузка через `DataTransfer`-инъекцию в `<input type=file>`, открытие
  резюме через `fetch` вернуло исходный контент байт-в-байт, `<img>` аватара `complete:true`)
- [x] Файл >10 МБ отклоняется (сервер проверяет `sizeBytes` на presign, ДО обращения к S3);
  не-PDF в резюме → 400 на presign
- [x] Ключи в БД имеют префикс companies/{companyId}/ — companyId берётся только из
  авторизованного контекста, никогда из тела запроса, поэтому чужой префикс структурно
  недостижим (тест сравнивает ключи двух разных компаний)

## Как проверить
UI-загрузка + консоль MinIO (файл на месте) + попытка загрузить .exe.

## Подводные камни
CORS на бакете для PUT с localhost:5173 (MinIO: mc admin / консоль). presignDownload с коротким
TTL (5 мин) — не хранить готовые URL в БД, только ключи.

## Находки (реальные проблемы совместимости с MinIO, не гипотетические)
1. **AWS SDK v3 по умолчанию шлёт трейлерные чек-суммы** (`x-amz-checksum-*`), которые эта
   версия MinIO не поддерживает → любой вызов падал с `501 NotImplemented`. Исправлено:
   `requestChecksumCalculation: "WHEN_REQUIRED"` и `responseChecksumValidation: "WHEN_REQUIRED"`
   в конфиге `S3Client`.
2. **`PutBucketCorsCommand` не реализован в MinIO** — ни через AWS SDK, ни через `mc cors set`
   (оба возвращают ту же `501 NotImplemented`; проверено напрямую). Настройка CORS в MinIO —
   не per-bucket S3 API, а серверный конфиг `api cors_allow_origin` (по умолчанию `*` в
   `docker-compose.yml`, см. `mc admin config get local api`) — то есть локально уже разрешено
   из коробки, программный вызов не нужен и был удалён из `ensureBucket()`.
3. **GH Actions `services:` не поддерживает переопределение command контейнера** — образ
   `minio/minio` без аргумента `server /data` завершается сразу. MinIO поднимается отдельным
   шагом `docker run` перед тестами (см. `ci.yml`), а не как `services:`.
4. **Порт localhost:9000 CORS в браузере**: фронт (порт 8443) шлёт PUT напрямую в MinIO
   (не через Vite-прокси `/api`, который проксирует только `/api/v1/...`) — это настоящий
   cross-origin запрос, и он реально проходит preflight (`OPTIONS` → 204) благодаря
   `cors_allow_origin: *` из находки 2.
5. Ограничение на размер (10 МБ) проверяется дважды: на входе в presign (`sizeBytes` в zod-схеме,
   немедленный 400 без обращения к S3) и через подписанный `ContentLength` в `PutObjectCommand`
   (MinIO отклонит PUT, если реальное тело не совпадает с заявленным размером) — второе
   защищает от переиспользования presigned URL с другим по размеру файлом.
