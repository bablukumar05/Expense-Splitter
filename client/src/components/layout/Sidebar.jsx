import { LogOut, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/useAuth";
import { useLogout } from "@/features/auth/useLogout";
import { cn } from "@/lib/cn";
import { APP_NAME } from "@/lib/constants";
import { NAV_ITEMS } from "./nav";

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-canvas/70 p-4 backdrop-blur-xl md:flex">
      <Link to="/" className="mb-6 flex items-center gap-3 rounded-xl px-2 py-1.5">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
          <Wallet className="size-5 text-white" />
        </span>
        <span className="text-lg font-bold">{APP_NAME}</span>
      </Link>

      <nav aria-label="Primary" className="space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                active ? "bg-white/10 text-ink" : "text-muted hover:bg-white/5 hover:text-ink"
              )}
            >
              <Icon className={cn("size-5", active && "text-violet-300")} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-2xl border border-line bg-white/[0.04] p-3">
        <Avatar name={user?.name} src={user?.avatar} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-muted">{user?.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
          <LogOut className="size-5" />
        </Button>
      </div>
    </aside>
  );
}
