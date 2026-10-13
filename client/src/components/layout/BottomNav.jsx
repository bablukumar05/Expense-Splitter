import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./nav";

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas-2/90 backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {NAV_ITEMS.map(({ to, label, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition",
                  active ? "text-ink" : "text-muted hover:text-ink"
                )}
              >
                <Icon className={cn("size-5", active && "text-blue-400")} aria-hidden="true" />

                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
