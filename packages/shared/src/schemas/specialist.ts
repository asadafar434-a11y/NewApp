import { z } from "zod";

export const specialistStatusSchema = z.enum([
  "new",
  "contacted",
  "scheduled",
  "interviewed",
  "hired",
  "rejected",
  "consult_scheduled",
  "consult_done",
]);

export const createSpecialistSchema = z.object({
  requestId: z.string(),
  name: z.string().min(2).max(200),
  role: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  exp: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  salary: z.string().max(100).optional(),
  source: z.string().max(100).optional(),
  skills: z.array(z.string().max(50)).max(30).default([]),
  about: z.string().max(5000).optional(),
  portfolioUrl: z.string().url().optional(),
  availability: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  resumeKey: z.string().optional(),
  avatarKey: z.string().optional(),
});

export const specialistSchema = createSpecialistSchema.extend({
  id: z.string(),
  status: specialistStatusSchema,
  matchScore: z.number().int().min(0).max(100).nullable(),
  matchReason: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const updateSpecialistSchema = createSpecialistSchema.partial().omit({
  requestId: true,
});

export const changeStatusSchema = z.object({ status: specialistStatusSchema });

export const listSpecialistsQuerySchema = z.object({
  requestId: z.string().optional(),
  status: specialistStatusSchema.optional(),
  search: z.string().max(200).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const specialistListResponseSchema = z.object({
  items: z.array(specialistSchema),
  nextCursor: z.string().nullable(),
});

export const statusChangeSchema = z.object({
  id: z.string(),
  fromStatus: specialistStatusSchema,
  toStatus: specialistStatusSchema,
  createdAt: z.string().datetime(),
});

export const scheduledCallSchema = z.object({
  id: z.string(),
  specialistId: z.string(),
  scheduledAt: z.string().datetime(),
  link: z.string().nullable(),
  status: z.enum(["scheduled", "canceled", "completed"]),
  resultNote: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const specialistDetailSchema = specialistSchema.extend({
  statusChanges: z.array(statusChangeSchema),
  calls: z.array(scheduledCallSchema),
});

export type SpecialistStatus = z.infer<typeof specialistStatusSchema>;
export type CreateSpecialistInput = z.infer<typeof createSpecialistSchema>;
export type UpdateSpecialistInput = z.infer<typeof updateSpecialistSchema>;
export type SpecialistDTO = z.infer<typeof specialistSchema>;
export type SpecialistDetailDTO = z.infer<typeof specialistDetailSchema>;
export type ListSpecialistsQuery = z.infer<typeof listSpecialistsQuerySchema>;
