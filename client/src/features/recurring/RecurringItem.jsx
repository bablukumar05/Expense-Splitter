import { useState } from "react";
import {
  Calendar,
  FastForward,
  Pause,
  Pencil,
  Play,
  RotateCw,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DropdownMenu from "@/components/ui/DropdownMenu";
import MoneyText from "@/components/ui/MoneyText";
import { categoryOf } from "@/lib/constants";
import { formatDay } from "@/lib/format";
import {
  useDeleteRecurring,
  usePauseRecurring,
  useResumeRecurring,
  useRunRecurring,
  useSkipRecurring,
} from "./hooks";
import { STATUS_UI, describeSchedule, recurringStatus } from "./utils";

export default function RecurringItem({ item, currency = "INR", groupId }) {
  const gId = groupId || item.group;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);

  const pauseMutation = usePauseRecurring(gId);
  const resumeMutation = useResumeRecurring(gId);
  const skipMutation = useSkipRecurring(gId);
  const runMutation = useRunRecurring(gId);
  const deleteMutation = useDeleteRecurring(gId);

  const isBusy =
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    skipMutation.isPending ||
    runMutation.isPending ||
    deleteMutation.isPending;

  const status = recurringStatus(item);
  const statusConfig = STATUS_UI[status] || STATUS_UI.active;
  const category = categoryOf(item.category);
  const isPaused = status === "paused";
  const isCompleted = status === "completed";

  const handleTogglePause = async () => {
    try {
      if (isPaused) {
        await resumeMutation.mutateAsync(item._id);
        toast.success(`Resumed "${item.description}"`);
      } else {
        await pauseMutation.mutateAsync(item._id);
        toast.info(`Paused "${item.description}"`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSkip = async () => {
    try {
      await skipMutation.mutateAsync(item._id);
      toast.success("Skipped next occurrence");
      setSkipOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRunNow = async () => {
    try {
      await runMutation.mutateAsync(item._id);
      toast.success(`Generated expense for "${item.description}"`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(item._id);
      toast.success("Recurring expense stopped");
      setDeleteOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const dropdownItems = [
    !isCompleted && {
      label: "Skip next run",
      icon: FastForward,
      onSelect: () => setSkipOpen(true),
    },
    {
      label: "Run now",
      icon: Zap,
      onSelect: handleRunNow,
    },
    {
      label: "Delete schedule",
      icon: Trash2,
      tone: "danger",
      onSelect: () => setDeleteOpen(true),
    },
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-card/60 p-4 transition sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0">
        <span
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl"
          aria-hidden="true"
        >
          {category?.emoji || "📝"}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate font-semibold text-ink">{item.description}</h4>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusConfig.className}`}
            >
              {statusConfig.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-line bg-white/5 px-2 py-0.5 text-xs text-muted capitalize">
              <RotateCw className="size-3" />
              {item.frequency}
            </span>
          </div>

          <p className="text-xs text-muted">{describeSchedule(item)}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="font-semibold text-ink">
              <MoneyText value={item.amount} currency={currency} />
            </span>
            {item.nextRunAt && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  Next run: {formatDay(item.nextRunAt)}
                </span>
              </>
            )}
            {item.lastError && (
              <>
                <span>·</span>
                <span className="text-rose-400">Failed: {item.lastError}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 self-end sm:self-center">
        {!isCompleted && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleTogglePause}
            disabled={isBusy}
            title={isPaused ? "Resume schedule" : "Pause schedule"}
            aria-label={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="size-3.5 text-emerald-400" /> : <Pause className="size-3.5" />}
            <span className="hidden sm:inline text-xs">{isPaused ? "Resume" : "Pause"}</span>
          </Button>
        )}

        <ButtonLink
          to={`/groups/${gId}/recurring/${item._id}/edit`}
          size="sm"
          variant="ghost"
          title="Edit recurring expense"
          aria-label="Edit"
        >
          <Pencil className="size-3.5" />
          <span className="hidden sm:inline text-xs">Edit</span>
        </ButtonLink>

        <DropdownMenu items={dropdownItems} />
      </div>

      <ConfirmDialog
        open={skipOpen}
        onClose={() => setSkipOpen(false)}
        onConfirm={handleSkip}
        title="Skip next occurrence?"
        message="The next scheduled run will be skipped and advanced to the following cycle."
        confirmText="Skip next run"
        tone="warning"
        loading={skipMutation.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${item.description}"?`}
        message="This will stop and remove this recurring expense template. Existing expenses created in the past will not be affected."
        confirmText="Delete schedule"
        tone="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
