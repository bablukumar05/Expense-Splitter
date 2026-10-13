import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

export default function InsightsSkeleton() {
  return (
    <div role="status" aria-label="Loading insights" className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Card className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-56" />
      </Card>
      <Card className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </Card>
    </div>
  );
}
