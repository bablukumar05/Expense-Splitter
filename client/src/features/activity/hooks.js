import { useInfiniteQuery } from "@tanstack/react-query";
import { activityApi } from "@/api/activity";
import { queryKeys } from "@/lib/queryKeys";

export function useActivity(groupId) {
  return useInfiniteQuery({
    queryKey: queryKeys.activity(groupId),
    queryFn: ({ pageParam }) => activityApi.list(groupId, { before: pageParam ?? undefined, limit: 20 }),
    initialPageParam: null,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
  });
}
