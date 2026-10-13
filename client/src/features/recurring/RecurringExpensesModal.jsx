import { useState } from "react";
import { AlertCircle, Plus, Repeat } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import RecurringFormModal from "./RecurringFormModal";
import RecurringItem from "./RecurringItem";
import { useRecurringAction, useRecurringExpenses } from "./hooks";

export default function RecurringExpensesModal({
  open,
  onClose,
  group,
  me,
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isPending, error, refetch } = useRecurringExpenses(group?._id, {
    enabled: Boolean(open && group?._id),
  });
  const actions = useRecurringAction(group?._id);

  const recurringList = data?.recurringExpenses || [];
  const currency = group?.currency || "INR";

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Recurring Expenses"
        className="sm:max-w-2xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Add recurring
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Done
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {isPending ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <AlertCircle className="size-8 text-rose-400" />
              <p className="mt-2 text-xs font-medium text-ink">
                Failed to load recurring expenses
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : recurringList.length === 0 ? (
            <EmptyState
              icon={Repeat}
              title="No recurring expenses"
              description="Automate repeating bills like monthly rent, WiFi, or subscriptions so they post on schedule."
              action={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="size-4" />
                  Create recurring schedule
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {recurringList.map((item) => (
                <RecurringItem
                  key={item._id}
                  item={item}
                  currency={currency}
                  actions={actions}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>

      <RecurringFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        group={group}
        me={me}
      />
    </>
  );
}
