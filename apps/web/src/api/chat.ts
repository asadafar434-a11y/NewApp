import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ConversationListItemDTO, MessageDTO } from "@orbital/shared";
import { apiFetch } from "./client";
import { queryKeys } from "./queryKeys";

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations(),
    queryFn: () => apiFetch<{ items: ConversationListItemDTO[] }>("/conversations"),
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () =>
      apiFetch<{ items: MessageDTO[]; nextCursor: string | null }>(
        `/conversations/${conversationId}/messages?limit=50`,
      ),
    enabled: !!conversationId,
  });
}

type MessagesPage = { items: MessageDTO[]; nextCursor: string | null };

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) =>
      apiFetch<MessageDTO>(`/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    onMutate: async (text: string) => {
      const key = queryKeys.messages(conversationId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MessagesPage>(key);

      const optimistic: MessageDTO = {
        id: `optimistic-${Date.now()}`,
        sender: "owner",
        text,
        status: "sent",
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<MessagesPage>(key, (old) =>
        old ? { ...old, items: [optimistic, ...old.items] } : old,
      );

      return { previous };
    },
    onError: (_err, _text, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.messages(conversationId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      apiFetch<void>(`/conversations/${conversationId}/read`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    },
  });
}

/**
 * Открывает EventSource на /events один раз для всего приложения (вызывается из Root —
 * docs/tasks/T-024). withCredentials — иначе кука сессии не уйдёт с запросом.
 * Реконнект при обрыве — встроенное поведение EventSource, ничего писать не нужно.
 */
export function useChatEvents(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const base = import.meta.env.VITE_API_URL || "/api/v1";
    const source = new EventSource(`${base}/events`, { withCredentials: true });

    const handleEvent = (raw: MessageEvent<string>) => {
      let conversationId: string | undefined;
      try {
        conversationId = (JSON.parse(raw.data) as { conversationId?: string }).conversationId;
      } catch {
        conversationId = undefined;
      }
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    };

    source.addEventListener("message:new", handleEvent);
    source.addEventListener("message:status", handleEvent);

    return () => source.close();
  }, [enabled, queryClient]);
}
