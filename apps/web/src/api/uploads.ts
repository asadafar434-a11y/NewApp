import { useMutation } from "@tanstack/react-query";
import type { UploadKind } from "@orbital/shared";
import { apiFetch } from "./client";

/** presign → PUT напрямую в S3/MinIO → возвращает ключ для resumeKey/avatarKey специалиста. */
export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ file, kind }: { file: File; kind: UploadKind }) => {
      const { url, key } = await apiFetch<{ url: string; key: string }>("/uploads/presign", {
        method: "POST",
        body: JSON.stringify({ kind, contentType: file.type, sizeBytes: file.size }),
      });

      const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Не удалось загрузить файл");

      return key;
    },
  });
}

/** URL для GET /specialists/:id/files/:kind — 302-редирект на presigned MinIO-ссылку,
 * ничего не кэшируем: генерируется заново при каждом переходе. */
export function specialistFileUrl(specialistId: string, kind: UploadKind) {
  const base = import.meta.env.VITE_API_URL || "/api/v1";
  return `${base}/specialists/${specialistId}/files/${kind}`;
}
