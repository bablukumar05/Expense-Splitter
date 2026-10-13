import { useEffect, useRef } from "react";
import { Activity, Receipt, Repeat, Scale, TrendingUp, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";

const TABS = [
  { to: "expenses", label: "Expenses", icon: Receipt },
  { to: "balances", label: "Balances", icon: Scale },
  { to: "insights", label: "Insights", icon: TrendingUp },
  { to: "recurring", label: "Recurring", icon: Repeat },
  { to: "members", label: "Members", icon: Users },
  { to: "activity", label: "Activity", icon: Activity },
];

export default function GroupTabs() {
  const ref = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    ref.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <nav
      ref={ref}
      aria-label="Group sections"
      className="flex gap-1 overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.04] p-1.5 shadow-lg backdrop-blur-xl"
    >
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex h-11 min-w-fit flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-medium transition",
              isActive
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )
          }
        >
          <Icon className="hidden size-4 sm:block" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
