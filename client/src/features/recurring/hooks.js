import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { normalizeRecurring, normalizeRecurringList } from "@/api/normalize";
import { recurringApi } from "@/api/recurring";
import { queryKeys } from "@/lib/queryKeys";

export function useRecurringList(groupId, options = {}) {
  return useQuery({
    queryKey: queryKeys.recurring.list(groupId),
    queryFn: async () => {
      const data = await recurringApi.list(groupId);
      return normalizeRecurringList(data);
    },
    enabled: Boolean(groupId) && (options.enabled ?? true),
  });
}

export const useRecurringExpenses = useRecurringList;

export function useRecurring(id) {
  return useQuery({
    queryKey: queryKeys.recurring.detail(id),
    queryFn: async () => {
      const data = await recurringApi.get(id);
      return normalizeRecurring(data);
    },
    enabled: Boolean(id),
  });
}

export function useCreateRecurring(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => recurringApi.create(groupId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists(groupId) });
    },
  });
}

export function useUpdateRecurring(groupId, id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => recurringApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
      if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.recurring.list(groupId) });
    },
  });
}

export function usePauseRecurring(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => recurringApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
      if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.recurring.list(groupId) });
    },
  });
}

export function useResumeRecurring(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => recurringApi.resume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
      if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.recurring.list(groupId) });
    },
  });
}

export function useSkipRecurring(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => recurringApi.skip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
      if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.recurring.list(groupId) });
    },
  });
}

export function useDeleteRecurring(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => recurringApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
      if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.recurring.list(groupId) });
    },
  });
}

export function useRunRecurring(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => recurringApi.run(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.group(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.insights.all });
    },
  });
}

export function useRecurringAction(groupId) {
  const pauseMutation = usePauseRecurring(groupId);
  const resumeMutation = useResumeRecurring(groupId);
  const skipMutation = useSkipRecurring(groupId);
  const runMutation = useRunRecurring(groupId);
  const removeMutation = useDeleteRecurring(groupId);

  return {
    pause: pauseMutation.mutateAsync,
    resume: resumeMutation.mutateAsync,
    skip: skipMutation.mutateAsync,
    runNow: runMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    isPending:
      pauseMutation.isPending ||
      resumeMutation.isPending ||
      skipMutation.isPending ||
      runMutation.isPending ||
      removeMutation.isPending,
  };
}
