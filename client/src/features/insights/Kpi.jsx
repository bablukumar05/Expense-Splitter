import Card from "@/components/ui/Card";

export function KpiGrid({ children }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>;
}

export function Kpi({ label, hint, children }) {
  return (
    <Card variant="flat" className="min-w-0 p-3.5 sm:p-4">
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-1 text-lg font-bold sm:text-xl">{children}</div>
      {hint && <p className="mt-0.5 truncate text-xs text-muted">{hint}</p>}
    </Card>
  );
}
