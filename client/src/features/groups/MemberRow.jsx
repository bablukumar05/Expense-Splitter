import { Ban, GitMerge, ShieldCheck, ShieldOff, UserMinus } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import DropdownMenu from "@/components/ui/DropdownMenu";
import { formatDate } from "@/lib/format";

export default function MemberRow({ member, isMe, canManage, showEmail, onAction }) {
  const act = (type) => () => onAction(type, member);

  const items = member.isPlaceholder
    ? [
        { label: "Merge into a member", icon: GitMerge, onSelect: act("merge") },
        { label: "Remove", icon: UserMinus, tone: "danger", onSelect: act("remove") },
      ]
    : [
        member.role === "admin"
          ? { label: "Remove admin", icon: ShieldOff, onSelect: act("demote") }
          : { label: "Make admin", icon: ShieldCheck, onSelect: act("promote") },
        { label: "Remove from group", icon: UserMinus, tone: "danger", onSelect: act("remove") },
        { label: "Remove and block", icon: Ban, tone: "danger", onSelect: act("block") },
      ];

  const subtitle = member.isPlaceholder
    ? "No account yet"
    : showEmail && member.user?.email
      ? member.user.email
      : `Joined ${formatDate(member.joinedAt)}`;

  return (
    <li className="flex items-center gap-3 px-3.5 py-3 sm:px-4">
      <Avatar name={member.name} src={member.user?.avatar} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {member.name}
          {isMe && <span className="ml-1.5 text-xs font-normal text-muted">(you)</span>}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {member.role === "admin" && <Badge tone="brand">Admin</Badge>}
          {member.isPlaceholder && <Badge tone="warn">Placeholder</Badge>}
          <span className="truncate">{subtitle}</span>
        </div>
      </div>

      {canManage && !isMe && <DropdownMenu label={`Actions for ${member.name}`} items={items} />}
    </li>
  );
}
