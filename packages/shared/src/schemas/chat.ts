import { z } from "zod";

export const messageSchema = z.object({
  id: z.string(),
  sender: z.enum(["owner", "specialist"]),
  text: z.string(),
  status: z.enum(["sent", "delivered", "read"]),
  createdAt: z.string().datetime(),
});

export const sendMessageSchema = z.object({ text: z.string().min(1).max(5000) });

export const conversationListItemSchema = z.object({
  id: z.string(),
  specialistId: z.string(),
  specialistName: z.string(),
  specialistRole: z.string(),
  avatarKey: z.string().nullable(),
  lastMessage: messageSchema.nullable(),
  unreadCount: z.number().int(),
});

export const listMessagesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const messageListResponseSchema = z.object({
  items: z.array(messageSchema),
  nextCursor: z.string().nullable(),
});

export type MessageDTO = z.infer<typeof messageSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ConversationListItemDTO = z.infer<typeof conversationListItemSchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
