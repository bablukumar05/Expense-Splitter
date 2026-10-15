import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, RotateCw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Input, Textarea } from "@/components/ui/Input";
import MoneyInput from "@/components/ui/MoneyInput";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { buildParticipants, findMe } from "@/features/expenses/members";
import PayersField from "@/features/expenses/PayersField";
import SplitField from "@/features/expenses/SplitField";
import {
  computePaidBy,
  computeSplits,
  defaultPayerState,
  defaultSplitState,
  splitPayload,
  toPaise,
} from "@/features/expenses/split";
import { useGroup } from "@/features/groups/hooks";
import {
  useCreateRecurring,
  useRecurring,
  useUpdateRecurring,
} from "@/features/recurring/hooks";
import {
  initialEnd,
  payerStateFromTemplate,
  splitStateFromTemplate,
} from "@/features/recurring/utils";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CATEGORIES } from "@/lib/constants";
import { currencySymbol, parseMoney, todayInputValue } from "@/lib/format";

const FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

const END_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "date", label: "On date" },
  { value: "count", label: "After count" },
];

export default function RecurringFormPage() {
  const { groupId, recurringId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(recurringId);

  useDocumentTitle(isEdit ? "Edit recurring expense" : "New recurring expense");

  const groupQuery = useGroup(groupId);
  const recurringQuery = useRecurring(recurringId);
  const createMutation = useCreateRecurring(groupId);
  const updateMutation = useUpdateRecurring(groupId, recurringId);

  const group = groupQuery.data;
  const existing = recurringQuery.data;

  const me = useMemo(() => findMe(group, user), [group, user]);
  const participants = useMemo(
    () => (group ? buildParticipants(group, me, existing?.template) : []),
    [group, me, existing]
  );

  const [description, setDescription] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [category, setCategory] = useState("general");
  const [startDate, setStartDate] = useState(todayInputValue());
  const [endMode, setEndMode] = useState("never");
  const [endDate, setEndDate] = useState("");
  const [maxOccurrences, setMaxOccurrences] = useState("");
  const [notes, setNotes] = useState("");

  const [payers, setPayers] = useState(() => defaultPayerState(me?._id));
  const [split, setSplit] = useState(() => defaultSplitState(participants));
  const [attempted, setAttempted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isEdit && existing && !initialized && participants.length > 0) {
      setDescription(existing.description || "");
      setAmountInput(existing.amount ? String(existing.amount) : "");
      setFrequency(existing.frequency || "monthly");
      setCategory(existing.category || "general");
      setNotes(existing.notes || "");

      const endConfig = initialEnd(existing);
      setEndMode(endConfig.mode);
      setEndDate(endConfig.endDate);
      setMaxOccurrences(endConfig.maxOccurrences);

      setPayers(payerStateFromTemplate(existing));
      setSplit(splitStateFromTemplate(existing, participants));
      setInitialized(true);
    } else if (!isEdit && !initialized && me) {
      setPayers(defaultPayerState(me._id));
      setSplit(defaultSplitState(participants));
      setInitialized(true);
    }
  }, [isEdit, existing, initialized, participants, me]);

  const total = toPaise(parseMoney(amountInput));
  const prefix = currencySymbol(group?.currency || "INR");

  const rows = useMemo(
    () =>
      participants.map((p) => ({
        member: p._id,
        included: Boolean(split.included[p._id]),
        amount: split.values[p._id]?.amount ?? "",
        percentage: split.values[p._id]?.percentage ?? "",
        shares: split.values[p._id]?.shares ?? "1",
      })),
    [participants, split]
  );

  const paidResult = useMemo(
    () =>
      computePaidBy({
        mode: payers.mode,
        single: payers.single,
        amounts: payers.amounts,
        participants,
        total,
        currency: group?.currency || "INR",
      }),
    [payers, participants, total, group]
  );

  const splitResult = useMemo(
    () =>
      computeSplits({
        type: split.type,
        total,
        rows,
        currency: group?.currency || "INR",
      }),
    [split.type, total, rows, group]
  );

  if (groupQuery.isPending || (isEdit && recurringQuery.isPending)) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (groupQuery.isError || !group || (isEdit && recurringQuery.isError)) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load"
        description="Could not find the requested group or recurring expense schedule."
        action={
          <Button onClick={() => navigate(`/groups/${groupId}/recurring`)}>
            Back to recurring
          </Button>
        }
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    setErrorMsg("");

    if (!description.trim()) {
      setErrorMsg("Please enter a description");
      return;
    }

    if (!Number.isInteger(total) || total <= 0) {
      setErrorMsg("Please enter a valid amount");
      return;
    }

    if (paidResult.error || !paidResult.items) {
      setErrorMsg(paidResult.error || "Please check payer details");
      return;
    }

    if (splitResult.error || !splitResult.items) {
      setErrorMsg(splitResult.error || "Please check split details");
      return;
    }

    const payload = {
      description: description.trim(),
      amount: total / 100,
      category,
      notes: notes.trim() || undefined,
      paidBy: paidResult.items.map((p) => ({
        member: p.member,
        amount: p.amount / 100,
      })),
      splitType: split.type,
      splits: splitPayload(split.type, splitResult.items),
      endDate: endMode === "date" && endDate ? endDate : null,
      maxOccurrences:
        endMode === "count" && maxOccurrences ? Number(maxOccurrences) : null,
    };

    if (!isEdit) {
      payload.frequency = frequency;
      payload.currency = group.currency;
      if (startDate) {
        payload.startDate = startDate;
        payload.startsAt = new Date(startDate).toISOString();
      }
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
        toast.success("Recurring expense updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Recurring expense schedule created");
      }
      navigate(`/groups/${groupId}/recurring`);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          to={`/groups/${groupId}/recurring`}
          className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-ink transition"
          aria-label="Back to recurring"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink">
            {isEdit ? "Edit recurring expense" : "New recurring expense"}
          </h1>
          <p className="text-xs text-muted">
            {group.name} · {group.currency}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-300">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Card className="space-y-4">
          <Input
            label="Description"
            placeholder="e.g. Apartment Rent, Internet, Netflix"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MoneyInput
              label="Amount"
              prefix={prefix}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              required
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                Frequency
              </label>
              {isEdit ? (
                <div className="rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5 text-sm text-muted capitalize">
                  {frequency} (cannot be changed)
                </div>
              ) : (
                <SegmentedControl
                  options={FREQUENCY_OPTIONS}
                  value={frequency}
                  onChange={setFrequency}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </Select>

            {!isEdit && (
              <Input
                label="First run date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-sm">Schedule end</h3>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Ends
            </label>
            <SegmentedControl
              options={END_OPTIONS}
              value={endMode}
              onChange={setEndMode}
            />
          </div>

          {endMode === "date" && (
            <Input
              label="End date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || todayInputValue()}
              required
            />
          )}

          {endMode === "count" && (
            <Input
              label="Total occurrences"
              type="number"
              min="1"
              max="365"
              placeholder="e.g. 12"
              value={maxOccurrences}
              onChange={(e) => setMaxOccurrences(e.target.value)}
              required
            />
          )}
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-sm">Payment details</h3>
          <PayersField
            participants={participants}
            meId={me?._id}
            state={payers}
            onChange={setPayers}
            total={total}
            currency={group.currency}
            prefix={prefix}
            result={paidResult}
            showError={attempted}
          />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-sm">Split breakdown</h3>
          <SplitField
            participants={participants}
            meId={me?._id}
            state={split}
            onChange={setSplit}
            total={total}
            currency={group.currency}
            prefix={prefix}
            result={splitResult}
            showError={attempted}
          />
        </Card>

        <Card className="space-y-4">
          <Textarea
            label="Notes (optional)"
            placeholder="Add any additional details or notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/groups/${groupId}/recurring`)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            <RotateCw className="mr-2 size-4" />
            {isEdit ? "Update recurring expense" : "Save recurring schedule"}
          </Button>
        </div>
      </form>
    </div>
  );
}
