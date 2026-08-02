import { prisma } from "../lib/prisma.js";

/** Каждый метод требует companyId явным параметром — см. requests.repo.ts, тот же паттерн. */
export const conversationsRepo = {
  list(companyId: string) {
    return prisma.conversation.findMany({
      // deletedAt диалога сейчас никогда не ставится (нет UI для его удаления отдельно от
      // специалиста) — но soft-delete специалиста (T-020) не каскадируется на Conversation,
      // поэтому фильтруем ещё и по specialist.deletedAt, иначе диалог удалённого специалиста
      // продолжает висеть в списке.
      where: { companyId, deletedAt: null, specialist: { deletedAt: null } },
      include: {
        specialist: { select: { id: true, name: true, role: true, avatarKey: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: {
          select: { messages: { where: { sender: "specialist", status: { not: "read" } } } },
        },
      },
    });
  },

  get(companyId: string, id: string) {
    return prisma.conversation.findFirst({
      where: { id, companyId, deletedAt: null, specialist: { deletedAt: null } },
      select: { id: true },
    });
  },

  async listMessages(conversationId: string, cursor: string | undefined, limit: number) {
    const rows = await prisma.message.findMany({
      where: { conversationId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].id : null;
    return { items, nextCursor };
  },

  createMessage(conversationId: string, text: string) {
    return prisma.message.create({
      data: { conversationId, sender: "owner", text, status: "sent" },
    });
  },

  markRead(conversationId: string) {
    return prisma.message.updateMany({
      where: { conversationId, sender: "specialist", status: { not: "read" } },
      data: { status: "read" },
    });
  },
};
