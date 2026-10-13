import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { insightsApi } from "@/api/insights";
import { normalizeGroupStats, normalizePersonalStats } from "@/api/normalize";
import { queryKeys } from "@/lib/queryKeys";

export function useGroupStats(groupId, range, category) {
  return useQuery({
    queryKey: queryKeys.insights.group(groupId, { ...range, category: category || "" }),
    queryFn: () => insightsApi.group(groupId, { ...range, category }),
    select: normalizeGroupStats,
    enabled: Boolean(range),
    placeholderData: keepPreviousData,
  });
}

export function usePersonalStats(range) {
  return useQuery({
    queryKey: queryKeys.insights.me({ ...range }),
    queryFn: () => insightsApi.me(range),
    select: normalizePersonalStats,
    enabled: Boolean(range),
    placeholderData: keepPreviousData,
  });
}
