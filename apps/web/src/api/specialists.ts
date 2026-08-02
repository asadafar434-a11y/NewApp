import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SpecialistDetailDTO, SpecialistDTO, SpecialistStatus } from "@orbital/shared";
import { apiFetch } from "./client";
import { queryKeys } from "./queryKeys";

type SpecialistFilters = {
  requestId?: string;
  status?: SpecialistStatus;
  search?: string;
  cursor?: string;
  limit?: number;
};

type CreateSpecialistForm = {
  requestId: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  exp?: string;
  location?: string;
  salary?: string;
  source?: string;
  /** Через запятую, как вводит пользователь — разбивка на массив происходит здесь. */
  skillsText?: string;
  about?: string;
  portfolioUrl?: string;
  availability?: string;
  timezone?: string;
};

type UpdateSpecialistForm = Partial<Omit<CreateSpecialistForm, "requestId">>;

function toQueryString(filters: SpecialistFilters) {
  const params = new URLSearchParams();
  if (filters.requestId) params.set("requestId", filters.requestId);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.cursor) params.set("cursor", filters.cursor);
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useSpecialists(
  filters: SpecialistFilters = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.specialists(filters),
    queryFn: () =>
      apiFetch<{ items: SpecialistDTO[]; nextCursor: string | null }>(
        `/specialists${toQueryString(filters)}`,
      ),
    enabled: options.enabled,
  });
}

export function useSpecialist(id: string) {
  return useQuery({
    queryKey: queryKeys.specialist(id),
    queryFn: () => apiFetch<SpecialistDetailDTO>(`/specialists/${id}`),
    enabled: !!id,
  });
}

export function useCreateSpecialist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: CreateSpecialistForm) => {
      const { skillsText, ...rest } = form;
      const skills = (skillsText ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      return apiFetch<SpecialistDetailDTO>("/specialists", {
        method: "POST",
        body: JSON.stringify({ ...rest, skills }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
    },
  });
}

export function useUpdateSpecialist(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: UpdateSpecialistForm) => {
      const { skillsText, ...rest } = form;
      const skills =
        skillsText === undefined
          ? undefined
          : skillsText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

      return apiFetch<SpecialistDetailDTO>(`/specialists/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...rest, skills }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.specialist(id) });
    },
  });
}

export function useDeleteSpecialist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/specialists/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
    },
  });
}
