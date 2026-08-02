import type { RequestStatus, RequestType } from "@orbital/shared";
import { prisma } from "../lib/prisma.js";

type ListFilters = { type?: RequestType; status?: RequestStatus };

const withSpecialistCount = {
  include: { _count: { select: { specialists: { where: { deletedAt: null } } } } },
} as const;

/** Каждый метод требует companyId явным параметром — запрос «без компании» невозможен
 * по сигнатуре (docs/07-auth-and-security.md, «где проверяются права»). */
export const requestsRepo = {
  list(companyId: string, filters: ListFilters = {}) {
    return prisma.request.findMany({
      where: { companyId, deletedAt: null, ...filters },
      orderBy: { createdAt: "desc" },
      ...withSpecialistCount,
    });
  },

  get(companyId: string, id: string) {
    return prisma.request.findFirst({
      where: { id, companyId, deletedAt: null },
      ...withSpecialistCount,
    });
  },

  async create(
    companyId: string,
    data: { type: RequestType; title: string; description: string; priceKopecks: number | null },
  ) {
    const row = await prisma.request.create({ data: { ...data, companyId } });
    return { ...row, _count: { specialists: 0 } };
  },

  async update(
    companyId: string,
    id: string,
    data: Partial<{
      type: RequestType;
      title: string;
      description: string;
      priceKopecks: number | null;
      status: RequestStatus;
    }>,
  ) {
    const { count } = await prisma.request.updateMany({
      where: { id, companyId, deletedAt: null },
      data,
    });
    if (count === 0) return null;
    return this.get(companyId, id);
  },

  async softDelete(companyId: string, id: string) {
    const { count } = await prisma.request.updateMany({
      where: { id, companyId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return count > 0;
  },
};
