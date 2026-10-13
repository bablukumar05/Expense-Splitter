import {
  Activity,
  ArrowRightLeft,
  Ban,
  GitMerge,
  Link2,
  LogOut,
  MessageCircle,
  Pencil,
  Receipt,
  ShieldCheck,
  Sparkles,
  Trash2,
  Undo2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";

const ICONS = {
  GROUP_CREATED: Sparkles,
  GROUP_UPDATED: Pencil,
  MEMBER_JOINED: UserPlus,
  MEMBER_LEFT: LogOut,
  MEMBER_REMOVED: UserMinus,
  ROLE_CHANGED: ShieldCheck,
  PLACEHOLDER_ADDED: UserPlus,
  PLACEHOLDER_MERGED: GitMerge,
  INVITE_REGENERATED: Link2,
  INVITE_REVOKED: Ban,
  EXPENSE_ADDED: Receipt,
  EXPENSE_UPDATED: Pencil,
  EXPENSE_DELETED: Trash2,
  SETTLEMENT_ADDED: ArrowRightLeft,
  SETTLEMENT_UNDONE: Undo2,
  COMMENT_ADDED: MessageCircle,
};

const TONES = {
  EXPENSE_ADDED: "text-violet-300",
  SETTLEMENT_ADDED: "text-good",
  MEMBER_JOINED: "text-good",
  EXPENSE_DELETED: "text-bad",
  SETTLEMENT_UNDONE: "text-bad",
  MEMBER_REMOVED: "text-bad",
  MEMBER_LEFT: "text-bad",
  INVITE_REVOKED: "text-bad",
};

const EVENT_TYPE_MAP = {
  "group.created": "GROUP_CREATED",
  "group.updated": "GROUP_UPDATED",
  "group.placeholder_added": "PLACEHOLDER_ADDED",
  "group.member_joined": "MEMBER_JOINED",
  "group.member_removed": "MEMBER_REMOVED",
  "group.member_left": "MEMBER_LEFT",
  "group.role_changed": "ROLE_CHANGED",
  "group.placeholder_merged": "PLACEHOLDER_MERGED",
  "group.invite_regenerated": "INVITE_REGENERATED",
  "group.invite_revoked": "INVITE_REVOKED",
  "group.invitation_sent": "INVITE_REGENERATED",
  "expense.created": "EXPENSE_ADDED",
  "expense.updated": "EXPENSE_UPDATED",
  "expense.deleted": "EXPENSE_DELETED",
  "expense.commented": "COMMENT_ADDED",
  "settlement.created": "SETTLEMENT_ADDED",
  "settlement.voided": "SETTLEMENT_UNDONE",
};

const getNormalizedType = (activity) => {
  if (activity?.type && typeof activity.type === "string") {
    return activity.type;
  }
  if (activity?.event && typeof activity.event === "string") {
    return EVENT_TYPE_MAP[activity.event] || activity.event.replace(".", "_").toUpperCase();
  }
  return "";
};

const linkFor = (activity, groupId) => {
  if (!activity) return null;
  const base = `/groups/${groupId}`;
  const type = getNormalizedType(activity);
  const expenseId =
    activity.meta?.expenseId ??
    activity.metadata?.expenseId ??
    (activity.entityType === "expense" && type !== "EXPENSE_DELETED" ? activity.entityId : null);

  if (["EXPENSE_ADDED", "EXPENSE_UPDATED", "COMMENT_ADDED"].includes(type) && expenseId) {
    return `${base}/expenses/${expenseId}`;
  }
  if (type.startsWith("SETTLEMENT_")) return `${base}/balances`;
  if (
    type.startsWith("MEMBER_") ||
    type.startsWith("PLACEHOLDER_") ||
    type.startsWith("INVITE_") ||
    type === "ROLE_CHANGED"
  ) {
    return `${base}/members`;
  }
  if (type.startsWith("EXPENSE_")) {
    return `${base}/expenses`;
  }
  return null;
};

export default function ActivityItem({ activity, groupId }) {
  const type = getNormalizedType(activity);
  const Icon = ICONS[type] ?? Activity;
  const to = linkFor(activity, groupId);
  const rowClass = "flex items-start gap-3 px-3.5 py-3";

  const content = (
    <>
      <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
        <Icon className={cn("size-4", TONES[type] ?? "text-muted")} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm">{activity?.message || "Activity"}</p>
        <p className="mt-0.5 text-xs text-muted">{activity?.createdAt ? formatTime(activity.createdAt) : ""}</p>
      </div>
    </>
  );

  return (
    <li>
      {to ? (
        <Link to={to} className={cn(rowClass, "transition hover:bg-white/[0.06]")}>
          {content}
        </Link>
      ) : (
        <div className={rowClass}>{content}</div>
      )}
    </li>
  );
}
