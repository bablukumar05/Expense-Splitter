import { useState } from "react";
import { ArrowLeft, LogOut, Pencil, Trash2, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DropdownMenu from "@/components/ui/DropdownMenu";
import { typeLabel } from "@/lib/constants";
import DeleteGroupModal from "./DeleteGroupModal";
import EditGroupModal from "./EditGroupModal";
import { useLeaveGroup } from "./hooks";

export default function GroupHeader({ group, isAdmin, onInvite }) {
  const navigate = useNavigate();
  const leaveGroup = useLeaveGroup();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  const count = group.members.length;

  const confirmLeave = async () => {
    setLeaveError("");
    try {
      await leaveGroup.mutateAsync(group._id);
      toast.success(`You left "${group.name}"`);
      setLeaveOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      setLeaveError(getErrorMessage(error));
    }
  };

  const menuItems = [
    { label: "Edit group", icon: Pencil, hidden: !isAdmin, onSelect: () => setEditOpen(true) },
    {
      label: "Leave group",
      icon: LogOut,
      tone: "danger",
      onSelect: () => {
        setLeaveError("");
        setLeaveOpen(true);
      },
    },
    { label: "Delete group", icon: Trash2, tone: "danger", hidden: !isAdmin, onSelect: () => setDeleteOpen(true) },
  ];

  return (
    <header className="mb-5">
      <Link to="/" className="-ml-1 mb-1 inline-flex h-11 items-center gap-1.5 px-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> All groups
      </Link>

      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-3xl"
        >
          {group.emoji || "💸"}
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold">{group.name}</h1>
          <p className="truncate text-sm text-muted">
            {count} {count === 1 ? "member" : "members"} · {typeLabel(group.type)} · {group.currency}
          </p>
        </div>

        {isAdmin && (
          <Button onClick={onInvite} className="px-3 sm:px-5" aria-label="Invite people">
            <UserPlus className="size-4" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        )}
        <DropdownMenu label="Group options" items={menuItems} />
      </div>

      {group.description && <p className="mt-3 text-sm text-muted">{group.description}</p>}
      <div className="mt-3">
        <Badge tone={isAdmin ? "brand" : "neutral"}>{isAdmin ? "You're an admin" : "Member"}</Badge>
      </div>

      {isAdmin && (
        <>
          <EditGroupModal open={editOpen} onClose={() => setEditOpen(false)} group={group} />
          <DeleteGroupModal open={deleteOpen} onClose={() => setDeleteOpen(false)} group={group} />
        </>
      )}

      <ConfirmDialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onConfirm={confirmLeave}
        title={`Leave "${group.name}"?`}
        message={
          isAdmin
            ? "You can only leave once your balance is settled. If you're the only admin, the longest-standing member becomes the new admin. If you're the last member, the group is deleted."
            : "You can only leave once your balance is settled. You'll stop seeing this group, and you can rejoin later with an invite link."
        }
        confirmText="Leave group"
        loading={leaveGroup.isPending}
        error={leaveError}
      />
    </header>
  );
}
