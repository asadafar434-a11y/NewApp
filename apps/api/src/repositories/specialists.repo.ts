import type {
  CreateSpecialistInput,
  SpecialistStatus,
  UpdateSpecialistInput,
} from "@orbital/shared";
import { prisma } from "../lib/prisma.js";

type ListFilters = {
  requestId?: string;
  status?: SpecialistStatus;
  search?: string;
  cursor?: string;
  limit: number;
};

const detailInclude = {
  statusChanges: { orderBy: { createdAt: "asc" as const } },
  calls: { orderBy: { scheduledAt: "asc" as const } },
} as const;

/** Каждый метод требует companyId явным параметром — см. requests.repo.ts, тот же паттерн. */
export const specialistsRepo = {
  async list(companyId: string, filters: ListFilters) {
    const { requestId, status, search, cursor, limit } = filters;
    const rows = await prisma.specialist.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(requestId ? { requestId } : {}),
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { role: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].id : null;
    return { items, nextCursor };
  },

  get(companyId: string, id: string) {
    return prisma.specialist.findFirst({
      where: { id, companyId, deletedAt: null },
      include: detailInclude,
    });
  },

  requestBelongsToCompany(companyId: string, requestId: string) {
    return prisma.request.findFirst({
      where: { id: requestId, companyId, deletedAt: null },
      select: { id: true },
    });
  },

  getStatusContext(companyId: string, id: string) {
    return prisma.specialist.findFirst({
      where: { id, companyId, deletedAt: null },
      select: { id: true, status: true, request: { select: { type: true } } },
    });
  },

  /** fromStatus в where — оптимистичная блокировка: если статус успел уйти дальше между
   * проверкой в сервисе и этим вызовом, updateMany затронет 0 строк вместо рассинхрона с логом. */
  async changeStatus(
    companyId: string,
    id: string,
    fromStatus: SpecialistStatus,
    toStatus: SpecialistStatus,
  ) {
    return prisma.$transaction(async (tx) => {
      const { count } = await tx.specialist.updateMany({
        where: { id, companyId, deletedAt: null, status: fromStatus },
        data: { status: toStatus },
      });
      if (count === 0) return null;
      await tx.statusChange.create({ data: { specialistId: id, fromStatus, toStatus } });
      return tx.specialist.findUniqueOrThrow({ where: { id }, include: detailInclude });
    });
  },

  async create(companyId: string, data: CreateSpecialistInput) {
    const { requestId, ...rest } = data;
    return prisma.$transaction(async (tx) => {
      const specialist = await tx.specialist.create({
        data: { ...rest, companyId, requestId },
      });
      await tx.conversation.create({
        data: { companyId, specialistId: specialist.id },
      });
      return tx.specialist.findUniqueOrThrow({
        where: { id: specialist.id },
        include: detailInclude,
      });
    });
  },

  async update(companyId: string, id: string, data: UpdateSpecialistInput) {
    const { count } = await prisma.specialist.updateMany({
      where: { id, companyId, deletedAt: null },
      data,
    });
    if (count === 0) return null;
    return this.get(companyId, id);
  },

  async softDelete(companyId: string, id: string) {
    const { count } = await prisma.specialist.updateMany({
      where: { id, companyId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return count > 0;
  },
};
