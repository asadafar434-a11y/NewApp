import { ERROR_CODES, type ListMessagesQuery } from "@orbital/shared";
import { ApiError } from "../middleware/error-handler.js";
import { conversationsRepo } from "../repositories/conversations.repo.js";

type MessageRow = {
  id: string;
  sender: string;
  text: string;
  status: string;
  createdAt: Date;
};

function toMessageDTO(row: MessageRow) {
  return {
    id: row.id,
    sender: row.sender as "owner" | "specialist",
    text: row.text,
    status: row.status as "sent" | "delivered" | "read",
    createdAt: row.createdAt.toISOString(),
  };
}

export const conversationsService = {
  async list(companyId: string) {
    const rows = await conversationsRepo.list(companyId);

    const items = rows.map((row) => ({
      id: row.id,
      specialistId: row.specialist.id,
      specialistName: row.specialist.name,
      specialistRole: row.specialist.role,
      avatarKey: row.specialist.avatarKey,
      lastMessage: row.messages[0] ? toMessageDTO(row.messages[0]) : null,
      unreadCount: row._count.messages,
    }));

    // Сортировка по времени последнего сообщения, а не createdAt диалога (docs/tasks/T-023).
    items.sort((a, b) =>
      (b.lastMessage?.createdAt ?? "").localeCompare(a.lastMessage?.createdAt ?? ""),
    );

    return { items };
  },

  async getMessages(companyId: string, conversationId: string, query: ListMessagesQuery) {
    const conversation = await conversationsRepo.get(companyId, conversationId);
    if (!conversation) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Диалог не найден");

    const { items, nextCursor } = await conversationsRepo.listMessages(
      conversationId,
      query.cursor,
      query.limit,
    );
    return { items: items.map(toMessageDTO), nextCursor };
  },

  async sendMessage(companyId: string, conversationId: string, text: string) {
    const conversation = await conversationsRepo.get(companyId, conversationId);
    if (!conversation) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Диалог не найден");

    const message = await conversationsRepo.createMessage(conversationId, text);
    return toMessageDTO(message);
  },

  async markRead(companyId: string, conversationId: string) {
    const conversation = await conversationsRepo.get(companyId, conversationId);
    if (!conversation) throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Диалог не найден");

    await conversationsRepo.markRead(conversationId);
  },
};
