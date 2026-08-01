/** Фабрика ключей TanStack Query — docs/06-frontend.md, «Слой данных». */
export const queryKeys = {
  me: () => ["me"] as const,
  dashboard: () => ["dashboard"] as const,
  requests: () => ["requests"] as const,
  request: (id: string) => ["requests", id] as const,
  specialists: (filters?: Record<string, unknown>) => ["specialists", filters] as const,
  specialist: (id: string) => ["specialists", id] as const,
  conversations: () => ["conversations"] as const,
  messages: (conversationId: string) => ["messages", conversationId] as const,
  calls: () => ["calls"] as const,
  payments: () => ["payments"] as const,
  finance: () => ["finance"] as const,
  campaigns: () => ["campaigns"] as const,
  ops: () => ["ops"] as const,
  aiUsage: () => ["ai", "usage"] as const,
  notifications: () => ["notifications"] as const,
};
