import { useState } from "react";
import { AlertCircle, SearchX } from "lucide-react";
import { Outlet, useParams } from "react-router-dom";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/useAuth";
import GroupHeader from "@/features/groups/GroupHeader";
import GroupTabs from "@/features/groups/GroupTabs";
import InviteModal from "@/features/groups/InviteModal";
import { useGroup } from "@/features/groups/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

function GroupSkeleton() {
  return (
    <div role="status" aria-label="Loading group" className="space-y-5">
      <Skeleton className="h-5 w-24" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-14" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  );
}

export default function GroupLayout() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const query = useGroup(groupId);
  const [inviteOpen, setInviteOpen] = useState(false);

  const group = query.data;
  useDocumentTitle(group?.name);

  if (query.isPending) return <GroupSkeleton />;

  // data nahi aaya (pehli fetch fail hui)
  if (!group) {
    const status = query.error?.status;
    if (status === 404 || status === 400) {
      return (
        <EmptyState
          icon={SearchX}
          title="Group not found"
          description="This group doesn't exist, was deleted, or you're no longer a member."
          action={<ButtonLink to="/">Back to my groups</ButtonLink>}
        />
      );
    }
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn't load this group"
        description="Check your connection and try again."
        action={<Button onClick={() => query.refetch()}>Try again</Button>}
      />
    );
  }

  // Backend sirf active members bhejta hai; "me" nahi mila to access nahi hona chahiye
  const me = group.members.find((member) => member.user?._id === user._id);
  if (!me) {
    return (
      <EmptyState
        icon={SearchX}
        title="You're no longer a member"
        description="You don't have access to this group anymore."
        action={<ButtonLink to="/">Back to my groups</ButtonLink>}
      />
    );
  }

  const isAdmin = me.role === "admin";

  return (
    <>
      <GroupHeader group={group} isAdmin={isAdmin} onInvite={() => setInviteOpen(true)} />
      <GroupTabs />

      <div className="mt-5">
        <Outlet context={{ group, me, isAdmin, openInvite: () => setInviteOpen(true) }} />
      </div>

      {isAdmin && <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} group={group} />}
    </>
  );
}
