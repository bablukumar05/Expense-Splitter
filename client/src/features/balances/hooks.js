import { useCallback } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { balancesApi } from "@/api/balances";
import { settlementsApi } from "@/api/settlements";
import { queryKeys } from "@/lib/queryKeys";

export function useGroupBalances(groupId) {
  return useQuery({
    queryKey: queryKeys.balances.group(groupId),
    queryFn: () => balancesApi.group(groupId),
  });
}

export function useSettlementPlan(groupId) {
  return useQuery({
    queryKey: queryKeys.balances.plan(groupId),
    queryFn: () => balancesApi.plan(groupId),
  });
}

export function useSettlements(groupId) {
  return useInfiniteQuery({
    queryKey: queryKeys.settlements.lists(groupId),
    queryFn: ({ pageParam }) => settlementsApi.list(groupId, { page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined,
  });
}

function useLedgerRefresh(groupId) {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.settlements.lists(groupId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.activity(groupId) });
  }, [queryClient, groupId]);
}

export function useCreateSettlement(groupId) {
  const refresh = useLedgerRefresh(groupId);
  return useMutation({
    mutationFn: (body) => settlementsApi.create(groupId, body),
    onSettled: () => {
      refresh();
    },
  });
}

export function useUndoSettlement(groupId) {
  const refresh = useLedgerRefresh(groupId);
  return useMutation({
    mutationFn: (settlementId) => settlementsApi.undo(settlementId),
    onSettled: () => {
      refresh();
    },
  });
}
