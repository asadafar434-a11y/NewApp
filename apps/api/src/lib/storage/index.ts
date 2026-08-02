import { randomUUID } from "node:crypto";
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { UploadKind } from "@orbital/shared";
import { env } from "../env.js";

const UPLOAD_TTL_SECONDS = 300;
const DOWNLOAD_TTL_SECONDS = 300;

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const s3 = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
  forcePathStyle: true, // обязательно для MinIO — иначе SDK шлёт virtual-hosted style
  // AWS SDK v3 по умолчанию добавляет трейлерные чек-суммы (x-amz-checksum-*),
  // которые MinIO не поддерживает и отвечает 501 NotImplemented — отключаем.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

/** Ленивое идемпотентное создание бакета — единственный шаг настройки, который нужен коду.
 * CORS для браузерных PUT/GET — не через S3 PutBucketCors (MinIO отвечает 501 NotImplemented,
 * проверено и через SDK, и через `mc cors set` — эта команда S3 API в MinIO не реализована),
 * а через серверный `api cors_allow_origin` (по умолчанию `*` в docker-compose MinIO, см.
 * `mc admin config get local api`) — то есть локально уже разрешено из коробки. */
let bucketReady: Promise<void> | null = null;

function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      try {
        await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
      } catch {
        await s3.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
      }
    })().catch((err) => {
      bucketReady = null; // следующий вызов попробует снова, а не застрянет на отклонённом промисе
      throw err;
    });
  }
  return bucketReady;
}

/** companyId — только из авторизованного контекста вызывающего кода (никогда из входных
 * данных запроса), поэтому чужой префикс ключа структурно недостижим. */
export async function presignUpload(
  companyId: string,
  kind: UploadKind,
  contentType: string,
  sizeBytes: number,
) {
  await ensureBucket();

  const ext = EXTENSION_BY_CONTENT_TYPE[contentType];
  const key = `companies/${companyId}/${kind}/${randomUUID()}.${ext}`;

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: sizeBytes,
    }),
    { expiresIn: UPLOAD_TTL_SECONDS },
  );

  return { url, key };
}

/** Генерируется на каждый вызов с коротким TTL — готовые URL нигде не хранятся, только ключи. */
export async function presignDownload(key: string) {
  await ensureBucket();
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }), {
    expiresIn: DOWNLOAD_TTL_SECONDS,
  });
}
