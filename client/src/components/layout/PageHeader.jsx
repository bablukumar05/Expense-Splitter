import { cn } from "@/lib/cn";

export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn("mb-6 flex items-center gap-3", className)}>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
