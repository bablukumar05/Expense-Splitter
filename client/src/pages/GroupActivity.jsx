import { useMemo } from "react";
import { Activity, AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ActivityItem from "@/features/activity/ActivityItem";
import { useActivity } from "@/features/activity/hooks";
import { useGroupContext } from "@/features/groups/useGroupContext";
import { cn } from "@/lib/cn";
import { dayHeading, localDayKey } from "@/lib/format";

function ActivitySkeleton() {
  return (
    <div role="status" aria-label="Loading activity" className="space-y-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.04] p-3.5">
          <Skeleton className="size-9 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GroupActivity() {
  const { group } = useGroupContext();
  const query = useActivity(group._id);

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page?.activities ?? []) ?? [],
    [query.data]
  );

  const sections = useMemo(() => {
    const result = [];
    for (const activity of items) {
      if (!activity) continue;
      const key = activity.createdAt ? localDayKey(activity.createdAt) : "recent";
      const label = activity.createdAt ? dayHeading(activity.createdAt) : "Recent";
      const last = result[result.length - 1];
      if (last && last.key === key) last.items.push(activity);
      else result.push({ key, label, items: [activity] });
    }
    return result;
  }, [items]);

  const refreshing = query.isFetching && !query.isFetchingNextPage;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Activity</h2>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => query.refetch()}
          disabled={refreshing}
          aria-label="Refresh activity"
          aria-busy={refreshing}
        >
          <RefreshCw className={cn("size-5", refreshing && "animate-spin")} />
        </Button>
      </div>

      {query.isPending ? (
        <ActivitySkeleton />
      ) : query.isError && !query.data ? (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load activity"
          description="Check your connection and try again."
          action={<Button onClick={() => query.refetch()}>Try again</Button>}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Expenses, payments and member changes will show up here."
        />
      ) : (
        <>
          {sections.map((section) => (
            <section key={section.key} aria-label={section.label} className="mb-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{section.label}</h3>
              <Card as="ul" variant="flat" padded={false} className="divide-y divide-line">
                {section.items.map((activity, index) => (
                  <ActivityItem key={activity._id ?? activity.id ?? index} activity={activity} groupId={group._id} />
                ))}
              </Card>
            </section>
          ))}

          {query.hasNextPage && (
            <div className="flex flex-col items-center gap-2">
              <Button variant="secondary" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
                Load more
              </Button>
              {query.isFetchNextPageError && <p className="text-xs text-bad">Couldn't load more. Please try again.</p>}
            </div>
          )}
        </>
      )}
    </>
  );
}
