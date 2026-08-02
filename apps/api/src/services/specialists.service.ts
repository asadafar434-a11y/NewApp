import {
  ERROR_CODES,
  type CreateSpecialistInput,
  type ListSpecialistsQuery,
  type RequestType,
  type SpecialistStatus,
  type UpdateSpecialistInput,
  type UploadKind,
} from "@orbital/shared";
import { presignDownload } from "../lib/storage/index.js";
import { ApiError } from "../middleware/error-handler.js";
import { specialistsRepo } from "../repositories/specialists.repo.js";

const STATUS_LABELS: Record<SpecialistStatus, string> = {
  new: "Новый",
  contacted: "Написали",
  scheduled: "Запланирован",
  interviewed: "Интервью",
  hired: "Нанят",
  rejected: "Отказ",
  consult_scheduled: "Созвон назначен",
  consult_done: "Консультация проведена",
};

/** Допустимые переходы по типу заявки — docs/adr/ADR-0006-unified-request.md.
 * rejected достижим из любого нефинального статуса своего цикла. */
const STATUS_TRANSITIONS: Record<
  RequestType,
  Partial<Record<SpecialistStatus, SpecialistStatus[]>>
> = {
  hire: {
    new: ["contacted", "rejected"],
    contacted: ["scheduled", "rejected"],
    scheduled: ["interviewed", "rejected"],
    interviewed: ["hired", "rejected"],
  },
  consult: {
    new: ["contacted", "rejected"],
    contacted: ["consult_scheduled", "rejected"],
    consult_scheduled: ["consult_done", "rejected"],
  },
};

type ListRow = Awaited<ReturnType<typeof specialistsRepo.list>>["items"][number];
type DetailRow = NonNullable<Awaited<ReturnType<typeof specialistsRepo.get>>>;

function toDTO(row: ListRow) {
  return {
    id: row.id,
    requestId: row.requestId,
    name: row.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    exp: row.exp,
    location: row.location,
    salary: row.salary,
    source: row.source,
    skills: row.skills,
    about: row.about,
    portfolioUrl: row.portfolioUrl,
    availability: row.availability,
    timezone: row.timezone,
    resumeKey: row.resumeKey,
    avatarKey: row.avatarKey,
    status: row.status,
    matchScore: row.matchScore,
    matchReason: row.matchReason,
    createdAt: row.createdAt.toISOString(),
  };
}

function toDetailDTO(row: DetailRow) {
  return {
    ...toDTO(row),
    statusChanges: row.statusChanges.map((s) => ({
      id: s.id,
      fromStatus: s.fromStatus,
      toStatus: s.toStatus,
      createdAt: s.createdAt.toISOString(),
    })),
    calls: row.calls.map((c) => ({
      id: c.id,
      specialistId: c.specialistId,
      scheduledAt: c.scheduledAt.toISOString(),
      link: c.link,
      status: c.status,
      resultNote: c.resultNote,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

export const specialistsService = {
  async list(companyId: string, query: ListSpecialistsQuery) {
    const { items, nextCursor } = await specialistsRepo.list(companyId, query);
    return { items: items.map(toDTO), nextCursor };
  },

  async get(companyId: string, id: string) {
    const row = await specialistsRepo.get(companyId, id);
    if (!row) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Специалист не найден");
    return toDetailDTO(row);
  },

  async create(companyId: string, input: CreateSpecialistInput) {
    const request = await specialistsRepo.requestBelongsToCompany(companyId, input.requestId);
    if (!request) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Заявка не найдена");

    const row = await specialistsRepo.create(companyId, input);
    return toDetailDTO(row);
  },

  async update(companyId: string, id: string, input: UpdateSpecialistInput) {
    const row = await specialistsRepo.update(companyId, id, input);
    if (!row) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Специалист не найден");
    return toDetailDTO(row);
  },

  async remove(companyId: string, id: string) {
    const ok = await specialistsRepo.softDelete(companyId, id);
    if (!ok) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Специалист не найден");
  },

  async changeStatus(companyId: string, id: string, toStatus: SpecialistStatus) {
    const context = await specialistsRepo.getStatusContext(companyId, id);
    if (!context) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Специалист не найден");

    const fromStatus = context.status;
    const allowed = STATUS_TRANSITIONS[context.request.type][fromStatus] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new ApiError(
        400,
        ERROR_CODES.VALIDATION,
        `Нельзя перевести из «${STATUS_LABELS[fromStatus]}» в «${STATUS_LABELS[toStatus]}»`,
      );
    }

    const row = await specialistsRepo.changeStatus(companyId, id, fromStatus, toStatus);
    if (!row) {
      throw new ApiError(409, ERROR_CODES.CONFLICT, "Статус уже изменился — обновите страницу");
    }
    return toDetailDTO(row);
  },

  async getFileUrl(companyId: string, id: string, kind: UploadKind) {
    const row = await specialistsRepo.get(companyId, id);
    if (!row) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Специалист не найден");

    const key = kind === "resume" ? row.resumeKey : row.avatarKey;
    if (!key) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Файл не загружен");

    return presignDownload(key);
  },
};
