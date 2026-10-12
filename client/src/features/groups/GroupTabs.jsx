import { Activity, Receipt, Scale, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";

const TABS = [
  { to: "expenses", label: "Expenses", icon: Receipt },
  { to: "balances", label: "Balances", icon: Scale },
  { to: "members", label: "Members", icon: Users },
  { to: "activity", label: "Activity", icon: Activity },
];

export default function GroupTabs() {
  return (
    <nav
      aria-label="Group sections"
      className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white/[0.04] p-1"
    >
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex h-11 min-w-fit flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-medium transition",
              isActive ? "bg-white/10 text-ink" : "text-muted hover:text-ink"
            )
          }
        >
          {/* 320px par jagah kam hoti hai, isliye icon chhoti screen par hide */}
          <Icon className="hidden size-4 sm:block" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
