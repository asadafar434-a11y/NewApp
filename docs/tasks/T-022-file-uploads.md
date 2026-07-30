# T-022: Файлы — presigned upload резюме и аватаров

**Фаза:** 3 · **Оценка:** 4ч · **Зависит от:** T-019 · **Статус:** todo

## Цель
В форме специалиста загружаются PDF-резюме и аватар; файлы лежат в S3/MinIO, открываются из профиля.

## Контекст
`POST /uploads/presign` — [05-api.md](../05-api.md); ограничения — [07-auth-and-security.md](../07-auth-and-security.md#безопасность)
(строка «Файлы»). Локально — MinIO из T-004.

## Что сделать
- [ ] `src/lib/storage/index.ts`: S3-клиент (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`); `presignUpload(companyId, kind, contentType)` → `{ url, key }`; `presignDownload(key)`; ключи `companies/{companyId}/{kind}/{cuid}.{ext}`
- [ ] Роут presign: kind `resume|avatar`; resume → только application/pdf, avatar → image/jpeg|png|webp; лимит 10 МБ в policy
- [ ] Фронт: в форме специалиста input file → presign → PUT в S3 → key в resumeKey/avatarKey
- [ ] Профиль: кнопка «Резюме (PDF)» → presignDownload → открыть; аватар — картинкой
- [ ] Vitest: presign с чужим companyId невозможен (companyId из ctx), недопустимый contentType → 400

## Затрагиваемые файлы
- `apps/api/src/lib/storage/**`, `src/routes/uploads.routes.ts` — создать
- `apps/web/src/api/uploads.ts`, форма специалиста, CandidateDetail — изменить

## Критерии приёмки
- [ ] PDF загружается и открывается из профиля; аватар отображается в списке и деталях
- [ ] Файл >10 МБ отклоняется (S3 policy); не-PDF в резюме → 400 на presign
- [ ] Ключи в БД имеют префикс companies/{companyId}/

## Как проверить
UI-загрузка + консоль MinIO (файл на месте) + попытка загрузить .exe.

## Подводные камни
CORS на бакете для PUT с localhost:5173 (MinIO: mc admin / консоль). presignDownload с коротким
TTL (5 мин) — не хранить готовые URL в БД, только ключи.
