import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { balancesApi } from "@/api/balances";
import { groupsApi } from "@/api/groups";
import { queryKeys } from "@/lib/queryKeys";

const PAGE_SIZE = 12;

export function useGroups(search = "") {
  return useInfiniteQuery({
    queryKey: queryKeys.groups.list(search),
    queryFn: ({ pageParam }) => groupsApi.list({ page: pageParam, limit: PAGE_SIZE, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pages ? lastPage.pagination.page + 1 : undefined,
    // Search badalte waqt purane results dikhte rahein, screen khali na ho
    placeholderData: keepPreviousData,
  });
}

export function useMyBalances() {
  return useQuery({
    queryKey: queryKeys.balances.me,
    queryFn: () => balancesApi.me(),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => groupsApi.create(body),
    onSuccess: () => {
      // Naya group list aur summary dono mein dikhna chahiye
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.me });
    },
  });
}
