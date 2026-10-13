import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics";
import { queryKeys } from "@/lib/queryKeys";

export function useGroupStats(groupId, filters = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.analytics.group(groupId, filters),
    queryFn: () => analyticsApi.getGroupStats(groupId, filters),
    enabled: Boolean(groupId) && (options.enabled ?? true),
    staleTime: 60_000,
  });
}

export function useMyStats(filters = {}) {
  return useQuery({
    queryKey: queryKeys.analytics.me(),
    queryFn: () => analyticsApi.getMyStats(filters),
    staleTime: 60_000,
  });
}
