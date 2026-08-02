import { z } from "zod";

export const requestTypeSchema = z.enum(["hire", "consult"]);
export const requestStatusSchema = z.enum(["open", "in_progress", "done", "canceled"]);

export const createRequestSchema = z
  .object({
    type: requestTypeSchema,
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    priceKopecks: z.number().int().positive().max(100_000_000).nullable(),
  })
  .refine((v) => v.type !== "consult" || v.priceKopecks !== null, {
    message: "Для консультации нужна цена",
    path: ["priceKopecks"],
  });

export const requestSchema = z.object({
  id: z.string(),
  type: requestTypeSchema,
  title: z.string(),
  description: z.string(),
  priceKopecks: z.number().int().nullable(),
  status: requestStatusSchema,
  specialistCount: z.number().int(),
  createdAt: z.string().datetime(),
});

export const updateRequestSchema = createRequestSchema.innerType().partial().extend({
  status: requestStatusSchema.optional(),
});

export const listRequestsQuerySchema = z.object({
  type: requestTypeSchema.optional(),
  status: requestStatusSchema.optional(),
});

export type RequestType = z.infer<typeof requestTypeSchema>;
export type RequestStatus = z.infer<typeof requestStatusSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type RequestDTO = z.infer<typeof requestSchema>;
