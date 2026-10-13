import { useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, SearchX } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { applyFieldErrors, getErrorMessage } from "@/api/errors";
import { expensesApi } from "@/api/expenses";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import FormAlert from "@/components/ui/FormAlert";
import { Input, Textarea } from "@/components/ui/Input";
import MoneyInput from "@/components/ui/MoneyInput";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { useCreateExpense, useExpense, useUpdateExpense } from "@/features/expenses/hooks";
import { buildParticipants, findMe } from "@/features/expenses/members";
import PayersField from "@/features/expenses/PayersField";
import ReceiptPicker from "@/features/expenses/ReceiptPicker";
import { expenseBasicsSchema } from "@/features/expenses/schemas";
import SplitField from "@/features/expenses/SplitField";
import {
  computePaidBy,
  computeSplits,
  defaultPayerState,
  defaultSplitState,
  normalizePayload,
  payerStateFromExpense,
  payloadFromExpense,
  splitPayload,
  splitStateFromExpense,
  toPaise,
} from "@/features/expenses/split";
import { useGroup } from "@/features/groups/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CATEGORIES } from "@/lib/constants";
import { currencySymbol, dateInputValue, parseMoney, todayInputValue } from "@/lib/format";
import { prepareReceipt } from "@/lib/image";

const FIELD_NAMES = ["description", "amount", "category", "date", "notes"];

const describeError = (error) => {
  const entries = Object.entries(error?.fieldErrors ?? {});
  if (entries.length === 0) return getErrorMessage(error);
  return entries
    .slice(0, 3)
    .map(([field, message]) => `${field.replace(/\./g, " ")}: ${message}`)
    .join(" · ");
};

function FormSkeleton() {
  return (
    <div role="status" aria-label="Loading form" className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64" />
      <Skeleton className="h-40" />
      <Skeleton className="h-72" />
    </div>
  );
}

function ExpenseForm({ group, me, expense }) {
  const isEdit = Boolean(expense);
  const navigate = useNavigate();
  const create = useCreateExpense(group._id);
  const update = useUpdateExpense(group._id, expense?._id);

  const participants = useMemo(() => buildParticipants(group, me, expense), [group, me, expense]);
  const symbol = currencySymbol(group.currency);
  const prefix = symbol.length <= 2 ? symbol : null;

  const [payers, setPayers] = useState(() =>
    expense ? payerStateFromExpense(expense) : defaultPayerState(me._id)
  );
  const [split, setSplit] = useState(() =>
    expense ? splitStateFromExpense(expense) : defaultSplitState(participants)
  );
  const [receiptFile, setReceiptFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [attempted, setAttempted] = useState(false);

  const payersRef = useRef(null);
  const splitRef = useRef(null);
  const errorRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseBasicsSchema),
    defaultValues: expense
      ? {
          description: expense.description,
          amount: String(expense.amount),
          category: expense.category,
          date: dateInputValue(expense.date),
          notes: expense.notes ?? "",
        }
      : { description: "", amount: "", category: "general", date: todayInputValue(), notes: "" },
    mode: "onTouched",
  });

  const total = toPaise(parseMoney(watch("amount")));

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
    currency: group.currency,
  });
  const splitResult = computeSplits({ type: split.type, total, rows, currency: group.currency });

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  const onInvalid = () => setAttempted(true);

  const onValid = async (values) => {
    setAttempted(true);
    setFormError("");

    if (paidResult.error || splitResult.error || !paidResult.items || !splitResult.items) {
      scrollTo(paidResult.error ? payersRef : splitRef);
      return;
    }

    const payload = {
      description: values.description,
      amount: total / 100,
      category: values.category,
      date: values.date,
      notes: values.notes,
      paidBy: paidResult.items.map((p) => ({ member: p.member, amount: p.amount / 100 })),
      splitType: split.type,
      splits: splitPayload(split.type, splitResult.items),
    };

    try {
      if (isEdit) {
        if (normalizePayload(payload) === normalizePayload(payloadFromExpense(expense))) {
          toast.info("No changes to save.");
          navigate(`/groups/${group._id}/expenses/${expense._id}`, { replace: true });
          return;
        }
        await update.mutateAsync(payload);
        toast.success("Expense updated");
        navigate(`/groups/${group._id}/expenses/${expense._id}`, { replace: true });
        return;
      }

      const { expense: created } = await create.mutateAsync(payload);

      if (receiptFile) {
        try {
          const prepared = await prepareReceipt(receiptFile);
          await expensesApi.uploadReceipt(created._id, prepared);
        } catch {
          toast.error("Expense saved, but the receipt couldn't be uploaded. You can add it from the expense page.");
        }
      }

      toast.success("Expense added");
      navigate(`/groups/${group._id}/expenses`, { replace: true });
    } catch (error) {
      applyFieldErrors(error, setError, FIELD_NAMES);
      setFormError(describeError(error));
      setTimeout(() => scrollTo(errorRef), 50);
    }
  };

  const backTo = isEdit
    ? `/groups/${group._id}/expenses/${expense._id}`
    : `/groups/${group._id}/expenses`;
  const canAutofocus = !isEdit && window.matchMedia("(pointer: fine)").matches;

  return (
    <>
      <Link
        to={backTo}
        className="-ml-1 mb-1 inline-flex h-11 items-center gap-1.5 px-1 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> {isEdit ? "Back to expense" : "Back to expenses"}
      </Link>
      <PageHeader title={isEdit ? "Edit expense" : "Add expense"} subtitle={group.name} />

      <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate className="space-y-5">
        <Card className="space-y-4">
          <Input
            label="Description"
            placeholder="Dinner, Hotel, Taxi..."
            autoComplete="off"
            maxLength={100}
            autoFocus={canAutofocus}
            error={errors.description?.message}
            {...register("description")}
          />
          <MoneyInput
            label={`Amount (${group.currency})`}
            prefix={prefix}
            error={errors.amount?.message}
            {...register("amount")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Category" error={errors.category?.message} {...register("category")}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              label="Date"
              max={todayInputValue()}
              error={errors.date?.message}
              {...register("date")}
            />
          </div>
        </Card>

        <div ref={payersRef}>
          <Card className="space-y-3">
            <h2 className="font-semibold">Who paid?</h2>
            <PayersField
              participants={participants}
              meId={me._id}
              state={payers}
              onChange={setPayers}
              total={total}
              currency={group.currency}
              prefix={prefix}
              result={paidResult}
              showError={attempted}
            />
          </Card>
        </div>

        <div ref={splitRef}>
          <Card className="space-y-3">
            <h2 className="font-semibold">How is it split?</h2>
            <SplitField
              participants={participants}
              meId={me._id}
              state={split}
              onChange={setSplit}
              total={total}
              currency={group.currency}
              prefix={prefix}
              result={splitResult}
              showError={attempted}
            />
          </Card>
        </div>

        <Card className="space-y-4">
          <Textarea
            label="Notes (optional)"
            rows={2}
            maxLength={500}
            placeholder="Anything worth remembering"
            error={errors.notes?.message}
            {...register("notes")}
          />
          {!isEdit && <ReceiptPicker file={receiptFile} onChange={setReceiptFile} />}
        </Card>

        <div ref={errorRef}>
          <FormAlert>{formError}</FormAlert>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <ButtonLink to={backTo} variant="ghost">
            Cancel
          </ButtonLink>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Add expense"}
          </Button>
        </div>
      </form>
    </>
  );
}

export default function ExpenseFormPage() {
  const { groupId, expenseId } = useParams();
  const isEdit = Boolean(expenseId);
  const { user } = useAuth();
  const groupQuery = useGroup(groupId);
  const expenseQuery = useExpense(expenseId, { enabled: isEdit });
  useDocumentTitle(isEdit ? "Edit expense" : "Add expense");

  const group = groupQuery.data;
  const expense = isEdit ? expenseQuery.data : undefined;

  if (groupQuery.isPending || (isEdit && expenseQuery.isPending)) return <FormSkeleton />;

  if (!group || (isEdit && !expense)) {
    const status = groupQuery.error?.status ?? expenseQuery.error?.status;
    if (status === 404 || status === 400) {
      return (
        <EmptyState
          icon={SearchX}
          title="Not found"
          description="This group or expense doesn't exist, or you no longer have access."
          action={<ButtonLink to="/">Back to my groups</ButtonLink>}
        />
      );
    }
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn't load the form"
        description="Check your connection and try again."
        action={
          <Button
            onClick={() => {
              groupQuery.refetch();
              if (isEdit) expenseQuery.refetch();
            }}
          >
            Try again
          </Button>
        }
      />
    );
  }

  const me = findMe(group, user);
  if (!me) {
    return (
      <EmptyState
        icon={SearchX}
        title="You're not a member of this group"
        action={<ButtonLink to="/">Back to my groups</ButtonLink>}
      />
    );
  }

  if (isEdit) {
    if (expense.group !== group._id) {
      return (
        <EmptyState
          icon={SearchX}
          title="Expense not found"
          action={<ButtonLink to={`/groups/${group._id}/expenses`}>Back to expenses</ButtonLink>}
        />
      );
    }
    const canManage = me.role === "admin" || expense.createdBy === user._id;
    if (!canManage) {
      return (
        <EmptyState
          icon={SearchX}
          title="You can't edit this expense"
          description="Only the person who added it or a group admin can edit it."
          action={<ButtonLink to={`/groups/${group._id}/expenses/${expense._id}`}>Back to expense</ButtonLink>}
        />
      );
    }
  }

  return <ExpenseForm key={expense?._id ?? "new"} group={group} me={me} expense={expense} />;
}
