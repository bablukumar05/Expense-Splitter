import { useCallback } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { balancesApi } from "@/api/balances";
import { groupsApi } from "@/api/groups";
import { inviteApi } from "@/api/invite";
import { queryKeys } from "@/lib/queryKeys";

const PAGE_SIZE = 12;

export function useGroups(search = "") {
  return useInfiniteQuery({
    queryKey: queryKeys.groups.list(search),
    queryFn: ({ pageParam }) => groupsApi.list({ page: pageParam, limit: PAGE_SIZE, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pages ? lastPage.pagination.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}

export function useMyBalances() {
  return useQuery({ queryKey: queryKeys.balances.me, queryFn: () => balancesApi.me() });
}

export function useGroup(groupId) {
  return useQuery({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: () => groupsApi.get(groupId),
    select: (data) => data.group,
  });
}

export function useInvite(groupId, enabled) {
  return useQuery({
    queryKey: queryKeys.invite(groupId),
    queryFn: () => groupsApi.getInvite(groupId),
    select: (data) => data.invite,
    enabled,
    staleTime: 0,
  });
}

export function useInvitePreview(code) {
  return useQuery({
    queryKey: queryKeys.invitePreview(code),
    queryFn: () => inviteApi.preview(code),
    select: (data) => data.group,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

function useRefreshGroup(groupId) {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists }),
        queryClient.invalidateQueries({ queryKey: queryKeys.balances.me }),
      ]),
    [queryClient, groupId]
  );
}

function useRefreshLists() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists }),
        queryClient.invalidateQueries({ queryKey: queryKeys.balances.me }),
      ]),
    [queryClient]
  );
}

export function useCreateGroup() {
  const refresh = useRefreshLists();
  return useMutation({ mutationFn: (body) => groupsApi.create(body), onSuccess: refresh });
}

export function useUpdateGroup(groupId) {
  const refresh = useRefreshGroup(groupId);
  return useMutation({ mutationFn: (body) => groupsApi.update(groupId, body), onSuccess: refresh });
}

export function useAddPlaceholder(groupId) {
  const refresh = useRefreshGroup(groupId);
  return useMutation({ mutationFn: (name) => groupsApi.addPlaceholder(groupId, name), onSuccess: refresh });
}

export function useRemoveMember(groupId) {
  const refresh = useRefreshGroup(groupId);
  return useMutation({
    mutationFn: ({ memberId, block }) => groupsApi.removeMember(groupId, memberId, { block }),
    onSuccess: refresh,
  });
}

export function useChangeRole(groupId) {
  const refresh = useRefreshGroup(groupId);
  return useMutation({
    mutationFn: ({ memberId, role }) => groupsApi.changeRole(groupId, memberId, role),
    onSuccess: refresh,
  });
}

export function useMergePlaceholder(groupId) {
  const refresh = useRefreshGroup(groupId);
  return useMutation({
    mutationFn: ({ placeholderId, memberId }) => groupsApi.mergePlaceholder(groupId, placeholderId, memberId),
    onSuccess: refresh,
  });
}

export function useLeaveGroup() {
  const refresh = useRefreshLists();
  return useMutation({ mutationFn: (groupId) => groupsApi.leave(groupId), onSuccess: refresh });
}

export function useDeleteGroup() {
  const refresh = useRefreshLists();
  return useMutation({ mutationFn: (groupId) => groupsApi.remove(groupId), onSuccess: refresh });
}

export function useRestoreGroup() {
  const refresh = useRefreshLists();
  return useMutation({ mutationFn: (groupId) => groupsApi.restore(groupId), onSuccess: refresh });
}

export function useJoinGroup() {
  const refresh = useRefreshLists();
  return useMutation({ mutationFn: (code) => inviteApi.join(code), onSuccess: refresh });
}

function useInviteMutation(groupId, mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => queryClient.setQueryData(queryKeys.invite(groupId), data),
  });
}

export const useUpdateInvite = (groupId) =>
  useInviteMutation(groupId, (body) => groupsApi.updateInvite(groupId, body));

export const useRegenerateInvite = (groupId) =>
  useInviteMutation(groupId, () => groupsApi.regenerateInvite(groupId));

export function useInviteByEmail(groupId) {
  return useMutation({ mutationFn: (email) => groupsApi.inviteByEmail(groupId, email) });
}
