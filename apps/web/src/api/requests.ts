import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RequestDTO, RequestStatus, RequestType } from "@orbital/shared";
import { apiFetch } from "./client";
import { queryKeys } from "./queryKeys";

type CreateRequestForm = {
  type: RequestType;
  title: string;
  description: string;
  /** Цена в рублях, как её вводит пользователь — конвертация в копейки происходит здесь. */
  priceRubles: number | null;
};

type UpdateRequestForm = Partial<CreateRequestForm> & { status?: RequestStatus };

export function useRequests(filters: { type?: RequestType; status?: RequestStatus } = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  const qs = params.toString();

  return useQuery({
    queryKey: [...queryKeys.requests(), filters],
    queryFn: () => apiFetch<{ items: RequestDTO[] }>(`/requests${qs ? `?${qs}` : ""}`),
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: CreateRequestForm) =>
      apiFetch<RequestDTO>("/requests", {
        method: "POST",
        body: JSON.stringify({
          type: form.type,
          title: form.title,
          description: form.description,
          priceKopecks: form.priceRubles == null ? null : Math.round(form.priceRubles * 100),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests() });
    },
  });
}

export function useUpdateRequest(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: UpdateRequestForm) =>
      apiFetch<RequestDTO>(`/requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          priceRubles: undefined,
          priceKopecks:
            form.priceRubles === undefined
              ? undefined
              : form.priceRubles == null
                ? null
                : Math.round(form.priceRubles * 100),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests() });
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/requests/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests() });
    },
  });
}
