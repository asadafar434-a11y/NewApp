import { z } from "zod";

export const uploadKindSchema = z.enum(["resume", "avatar"]);

const CONTENT_TYPES_BY_KIND: Record<z.infer<typeof uploadKindSchema>, string[]> = {
  resume: ["application/pdf"],
  avatar: ["image/jpeg", "image/png", "image/webp"],
};

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const presignUploadSchema = z
  .object({
    kind: uploadKindSchema,
    contentType: z.string(),
    sizeBytes: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES),
  })
  .refine((v) => CONTENT_TYPES_BY_KIND[v.kind].includes(v.contentType), {
    message: "Недопустимый тип файла для этого вида загрузки",
    path: ["contentType"],
  });

export const presignUploadResponseSchema = z.object({
  url: z.string().url(),
  key: z.string(),
});

export type UploadKind = z.infer<typeof uploadKindSchema>;
export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
export type PresignUploadResponse = z.infer<typeof presignUploadResponseSchema>;
