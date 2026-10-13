import { AlertCircle, Plus, RotateCw } from "lucide-react";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { useGroupContext } from "@/features/groups/useGroupContext";
import { useRecurringList } from "@/features/recurring/hooks";
import RecurringItem from "@/features/recurring/RecurringItem";

export default function GroupRecurring() {
  const { group } = useGroupContext();
  const query = useRecurringList(group?._id);
  const items = query.data ?? [];

  const renderContent = () => {
    if (query.isPending) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex items-center justify-between p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-8 w-24" />
            </Card>
          ))}
        </div>
      );
    }

    if (query.isError) {
      return (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load recurring expenses"
          description="Check your network connection and try again."
          action={<Button onClick={() => query.refetch()}>Try again</Button>}
        />
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          icon={RotateCw}
          title="No recurring expenses"
          description="Automate repetitive expenses like rent, subscriptions, or bills."
          action={
            <ButtonLink to={`/groups/${group._id}/recurring/new`}>
              <Plus className="mr-1.5 size-4" />
              New recurring expense
            </ButtonLink>
          }
        />
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <RecurringItem
            key={item._id}
            item={item}
            groupId={group._id}
            currency={group.currency}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recurring expenses</h2>
          <p className="text-xs text-muted">Expenses that automatically repeat on a schedule.</p>
        </div>
        <ButtonLink to={`/groups/${group._id}/recurring/new`} size="sm">
          <Plus className="mr-1.5 size-4" />
          Add recurring
        </ButtonLink>
      </div>

      {renderContent()}
    </div>
  );
}
