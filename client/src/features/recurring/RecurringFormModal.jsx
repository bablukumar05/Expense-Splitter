import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import MoneyInput from "@/components/ui/MoneyInput";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import { CATEGORIES } from "@/lib/constants";
import { currencySymbol, parseMoney, todayInputValue } from "@/lib/format";
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
import { useCreateRecurring } from "./hooks";

const FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

export default function RecurringFormModal({
  open,
  onClose,
  group,
  me,
}) {
  const createRecurring = useCreateRecurring(group?._id);

  const participants = (group?.members || []).map((m) => ({
    _id: String(m._id),
    name: m.name,
    avatar: m.avatar,
  }));

  const [description, setDescription] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [category, setCategory] = useState("general");
  const [startsAt, setStartsAt] = useState(todayInputValue());
  const [notes, setNotes] = useState("");

  const [payers, setPayers] = useState(() => defaultPayerState(me?._id));
  const [split, setSplit] = useState(() => defaultSplitState(participants));
  const [attempted, setAttempted] = useState(false);
  const [formError, setFormError] = useState("");

  const total = toPaise(parseMoney(amountInput));
  const prefix = currencySymbol(group?.currency || "INR");

  const rows = participants.map((p) => ({
    member: p._id,
    included: Boolean(split.included[p._id]),
    amount: split.values[p._id]?.amount ?? "",
    percentage: split.values[p._id]?.percentage ?? "",
    shares: split.values[p._id]?.shares ?? "1",
  }));

  const paidResult = computePaidBy({
    mode: payers.mode,
    single: payers.single,
    amounts: payers.amounts,
    participants,
    total,
    currency: group?.currency || "INR",
  });

  const splitResult = computeSplits({
    type: split.type,
    total,
    rows,
    currency: group?.currency || "INR",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    setFormError("");

    if (!description.trim()) {
      setFormError("Description is required");
      return;
    }

    if (!Number.isInteger(total) || total <= 0) {
      setFormError("Enter a valid amount");
      return;
    }

    if (paidResult.error || splitResult.error || !paidResult.items || !splitResult.items) {
      setFormError(paidResult.error || splitResult.error || "Please check payers and split values");
      return;
    }

    const payload = {
      description: description.trim(),
      amount: total / 100,
      currency: group.currency,
      category,
      frequency,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      notes: notes.trim() || undefined,
      paidBy: paidResult.items.map((p) => ({ member: p.member, amount: p.amount / 100 })),
      splitType: split.type,
      splits: splitPayload(split.type, splitResult.items),
    };

    try {
      await createRecurring.mutateAsync(payload);
      toast.success("Recurring expense schedule created");
      onClose();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const categoryOptions = CATEGORIES.map((c) => ({
    value: c.value,
    label: `${c.emoji} ${c.label}`,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Recurring Expense"
      className="sm:max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createRecurring.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={createRecurring.isPending}>
            Save schedule
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {formError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {formError}
          </div>
        )}

        <Input
          label="Description"
          placeholder="e.g. WiFi bill, Rent, Netflix"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MoneyInput
            label="Amount"
            prefix={prefix}
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            required
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Repeat Frequency
            </label>
            <SegmentedControl
              options={FREQUENCY_OPTIONS}
              value={frequency}
              onChange={setFrequency}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoryOptions}
          />

          <Input
            label="First date"
            type="date"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>

        <div className="rounded-2xl border border-line/60 bg-white/[0.02] p-3.5 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Payment Details
          </h4>
          <PayersField
            participants={participants}
            meId={me?._id}
            state={payers}
            onChange={setPayers}
            total={total}
            currency={group?.currency || "INR"}
            prefix={prefix}
            result={paidResult}
            showError={attempted}
          />
        </div>

        <div className="rounded-2xl border border-line/60 bg-white/[0.02] p-3.5 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Split Breakdown
          </h4>
          <SplitField
            participants={participants}
            meId={me?._id}
            state={split}
            onChange={setSplit}
            total={total}
            currency={group?.currency || "INR"}
            prefix={prefix}
            result={splitResult}
            showError={attempted}
          />
        </div>

        <Input
          label="Notes (optional)"
          placeholder="Add any extra details"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </form>
    </Modal>
  );
}
