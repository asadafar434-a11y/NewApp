import { ERROR_CODES, type CreateRequestInput, type UpdateRequestInput } from "@orbital/shared";
import { ApiError } from "../middleware/error-handler.js";
import { requestsRepo } from "../repositories/requests.repo.js";

type RequestRow = Awaited<ReturnType<typeof requestsRepo.get>> & {};

function toDTO(row: NonNullable<RequestRow>) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    priceKopecks: row.priceKopecks,
    status: row.status,
    specialistCount: row._count.specialists,
    createdAt: row.createdAt.toISOString(),
  };
}

export const requestsService = {
  async list(companyId: string, filters: Parameters<typeof requestsRepo.list>[1]) {
    const rows = await requestsRepo.list(companyId, filters);
    return rows.map(toDTO);
  },

  async get(companyId: string, id: string) {
    const row = await requestsRepo.get(companyId, id);
    if (!row) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Заявка не найдена");
    return toDTO(row);
  },

  async create(companyId: string, input: CreateRequestInput) {
    const row = await requestsRepo.create(companyId, input);
    return toDTO(row);
  },

  async update(companyId: string, id: string, input: UpdateRequestInput) {
    const existing = await requestsRepo.get(companyId, id);
    if (!existing) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Заявка не найдена");

    // updateRequestSchema — partial, поэтому кросс-полевое правило из createRequestSchema
    // (refine) на него не действует — проверяем эффективное состояние сами.
    const effectiveType = input.type ?? existing.type;
    const effectivePrice =
      input.priceKopecks !== undefined ? input.priceKopecks : existing.priceKopecks;
    if (effectiveType === "consult" && effectivePrice == null) {
      throw new ApiError(400, ERROR_CODES.VALIDATION, "Для консультации нужна цена", {
        priceKopecks: ["Обязательно для типа consult"],
      });
    }

    const row = await requestsRepo.update(companyId, id, input);
    if (!row) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Заявка не найдена");
    return toDTO(row);
  },

  async remove(companyId: string, id: string) {
    const ok = await requestsRepo.softDelete(companyId, id);
    if (!ok) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Заявка не найдена");
  },
};
