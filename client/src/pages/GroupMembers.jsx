import { useMemo, useState } from "react";
import { Link2, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AddPlaceholderModal from "@/features/groups/AddPlaceholderModal";
import MemberRow from "@/features/groups/MemberRow";
import MergePlaceholderModal from "@/features/groups/MergePlaceholderModal";
import { useChangeRole, useRemoveMember } from "@/features/groups/hooks";
import { useGroupContext } from "@/features/groups/useGroupContext";
import { MAX_MEMBERS } from "@/lib/constants";

const ACTION_COPY = {
  remove: {
    title: (m) => `Remove ${m.name}?`,
    message: (m) =>
      m.isPlaceholder
        ? `${m.name} will be removed from the member list. Their past expenses stay in the history.`
        : `${m.name} will lose access to this group. Their past expenses stay in the history, and they can rejoin with an invite link.`,
    confirm: "Remove",
    tone: "danger",
    success: (m) => `${m.name} removed`,
  },
  block: {
    title: (m) => `Remove and block ${m.name}?`,
    message: (m) => `${m.name} will lose access and won't be able to rejoin with an invite link.`,
    confirm: "Remove and block",
    tone: "danger",
    success: (m) => `${m.name} removed and blocked`,
  },
  promote: {
    title: (m) => `Make ${m.name} an admin?`,
    message: () =>
      "Admins can invite and remove people, edit the group, manage the invite link and delete the group.",
    confirm: "Make admin",
    tone: "primary",
    success: (m) => `${m.name} is now an admin`,
  },
  demote: {
    title: (m) => `Remove ${m.name} as admin?`,
    message: (m) => `${m.name} will stay in the group as a regular member.`,
    confirm: "Remove admin",
    tone: "primary",
    success: (m) => `${m.name} is now a regular member`,
  },
};

const rank = (member, meId) => {
  if (member._id === meId) return 0;
  if (member.isPlaceholder) return 3;
  return member.role === "admin" ? 1 : 2;
};

export default function GroupMembers() {
  const { group, me, isAdmin, openInvite } = useGroupContext();
  const removeMember = useRemoveMember(group._id);
  const changeRole = useChangeRole(group._id);

  const [placeholderOpen, setPlaceholderOpen] = useState(false);
  const [mergeTarget, setMergeTarget] = useState(null);
  const [action, setAction] = useState(null);
  const [actionError, setActionError] = useState("");

  const members = useMemo(
    () =>
      [...group.members].sort(
        (a, b) => rank(a, me._id) - rank(b, me._id) || a.name.localeCompare(b.name)
      ),
    [group.members, me._id]
  );

  const handleAction = (type, member) => {
    if (type === "merge") {
      setMergeTarget(member);
      return;
    }
    setActionError("");
    setAction({ type, member });
  };

  const runAction = async () => {
    const { type, member } = action;
    setActionError("");
    try {
      if (type === "remove" || type === "block") {
        await removeMember.mutateAsync({ memberId: member._id, block: type === "block" });
      } else {
        await changeRole.mutateAsync({ memberId: member._id, role: type === "promote" ? "admin" : "member" });
      }
      toast.success(ACTION_COPY[type].success(member));
      setAction(null);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const copy = action ? ACTION_COPY[action.type] : null;
  const busy = removeMember.isPending || changeRole.isPending;
  const count = members.length;

  return (
    <>
      {isAdmin ? (
        <Card className="mb-5">
          <h2 className="font-semibold">Add people</h2>
          <p className="mt-1 text-sm text-muted">
            Share the invite link, or add a friend who isn't on the app yet as a placeholder.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={openInvite}>
              <Link2 className="size-4" /> Invite link
            </Button>
            <Button variant="secondary" onClick={() => setPlaceholderOpen(true)} disabled={count >= MAX_MEMBERS}>
              <UserPlus className="size-4" /> Add placeholder
            </Button>
          </div>
        </Card>
      ) : (
        <p className="mb-5 rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-sm text-muted">
          Only admins can invite or remove people. Ask an admin if you want to add someone.
        </p>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Members</h2>
        <Badge tone={count >= MAX_MEMBERS - 5 ? "warn" : "neutral"}>
          {count} / {MAX_MEMBERS}
        </Badge>
      </div>

      <Card as="ul" variant="flat" padded={false} aria-label="Group members" className="divide-y divide-line">
        {members.map((member) => (
          <MemberRow
            key={member._id}
            member={member}
            isMe={member._id === me._id}
            canManage={isAdmin}
            showEmail={isAdmin}
            onAction={handleAction}
          />
        ))}
      </Card>

      {isAdmin && (
        <AddPlaceholderModal open={placeholderOpen} onClose={() => setPlaceholderOpen(false)} group={group} />
      )}
      {isAdmin && (
        <MergePlaceholderModal
          open={Boolean(mergeTarget)}
          onClose={() => setMergeTarget(null)}
          group={group}
          placeholder={mergeTarget}
        />
      )}

      <ConfirmDialog
        open={Boolean(action)}
        onClose={() => setAction(null)}
        onConfirm={runAction}
        title={copy ? copy.title(action.member) : ""}
        message={copy ? copy.message(action.member) : ""}
        confirmText={copy?.confirm}
        tone={copy?.tone}
        loading={busy}
        error={actionError}
      >
        {/* Backend balance 0 na hone par rokta hai: seedha Balances tab ka rasta */}
        {actionError.toLowerCase().includes("unsettled") && (
          <Link
            to={`/groups/${group._id}/balances`}
            className="inline-block text-sm text-violet-300 underline-offset-4 hover:underline"
          >
            View balances
          </Link>
        )}
      </ConfirmDialog>
    </>
  );
}
