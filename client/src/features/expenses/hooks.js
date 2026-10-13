import { useCallback } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { expensesApi } from "@/api/expenses";
import { queryKeys } from "@/lib/queryKeys";

const PAGE_SIZE = 20;

export function useExpenses(groupId, filters) {
  return useInfiniteQuery({
    queryKey: queryKeys.expenses.list(groupId, filters),
    queryFn: ({ pageParam }) =>
      expensesApi.list(groupId, { ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}

export function useExpense(expenseId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.expenses.detail(expenseId),
    queryFn: () => expensesApi.get(expenseId),
    select: (data) => data.expense,
    enabled: enabled && Boolean(expenseId),
  });
}

export function useComments(expenseId) {
  return useInfiniteQuery({
    queryKey: queryKeys.expenses.comments(expenseId),
    queryFn: ({ pageParam }) =>
      expensesApi.comments(expenseId, { after: pageParam ?? undefined, limit: 20 }),
    initialPageParam: null,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
  });
}

function useExpenseRefresh(groupId) {
  const queryClient = useQueryClient();
  return useCallback(
    (expenseId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists(groupId) });
      if (expenseId) queryClient.invalidateQueries({ queryKey: queryKeys.expenses.detail(expenseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.insights.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity(groupId) });
    },
    [queryClient, groupId]
  );
}

export function useCreateExpense(groupId) {
  const refresh = useExpenseRefresh(groupId);
  return useMutation({
    mutationFn: (body) => expensesApi.create(groupId, body),
    onSuccess: (data) => {
      refresh(data.expense._id);
    },
  });
}

export function useUpdateExpense(groupId, expenseId) {
  const queryClient = useQueryClient();
  const refresh = useExpenseRefresh(groupId);
  return useMutation({
    mutationFn: (body) => expensesApi.update(expenseId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.expenses.detail(expenseId), data);
      refresh(expenseId);
    },
  });
}

export function useDeleteExpense(groupId) {
  const refresh = useExpenseRefresh(groupId);
  return useMutation({
    mutationFn: (expenseId) => expensesApi.remove(expenseId),
    onSuccess: () => {
      refresh();
    },
  });
}

export function useUploadReceipt(expenseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => expensesApi.uploadReceipt(expenseId, file),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.expenses.detail(expenseId), data),
  });
}

export function useRemoveReceipt(expenseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => expensesApi.removeReceipt(expenseId),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.expenses.detail(expenseId), data),
  });
}

export function useAddComment(expenseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text) => expensesApi.addComment(expenseId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.comments(expenseId) });
    },
  });
}

export function useDeleteComment(expenseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => expensesApi.removeComment(expenseId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.comments(expenseId) });
    },
  });
}
