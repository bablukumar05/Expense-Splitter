import { useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, Pencil, SearchX, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import MoneyText from "@/components/ui/MoneyText";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/useAuth";
import CommentsSection from "@/features/expenses/CommentsSection";
import { PositionText } from "@/features/expenses/ExpenseItem";
import { useDeleteExpense, useExpense } from "@/features/expenses/hooks";
import { buildMemberLookup, findMe } from "@/features/expenses/members";
import ReceiptSection from "@/features/expenses/ReceiptSection";
import { myPosition } from "@/features/expenses/split";
import { useGroup } from "@/features/groups/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { categoryOf, splitTypeLabel } from "@/lib/constants";
import { formatDay } from "@/lib/format";

function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading expense" className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40" />
      <Skeleton className="h-32" />
      <Skeleton className="h-48" />
    </div>
  );
}

export default function ExpenseDetailPage() {
  const { groupId, expenseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const groupQuery = useGroup(groupId);
  const expenseQuery = useExpense(expenseId);
  const deleteExpense = useDeleteExpense(groupId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const group = groupQuery.data;
  const expense = expenseQuery.data;
  const lookup = useMemo(() => (group ? buildMemberLookup(group) : null), [group]);
  useDocumentTitle(expense?.description);

  if (groupQuery.isPending || expenseQuery.isPending) return <DetailSkeleton />;

  if (!group || !expense) {
    const status = groupQuery.error?.status ?? expenseQuery.error?.status;
    if (status === 404 || status === 400) {
      return (
        <EmptyState
          icon={SearchX}
          title="Expense not found"
          description="It may have been deleted, or you no longer have access."
          action={<ButtonLink to={`/groups/${groupId}/expenses`}>Back to expenses</ButtonLink>}
        />
      );
    }
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn't load this expense"
        description="Check your connection and try again."
        action={
          <Button
            onClick={() => {
              groupQuery.refetch();
              expenseQuery.refetch();
            }}
          >
            Try again
          </Button>
        }
      />
    );
  }

  const me = findMe(group, user);
  if (!me || expense.group !== group._id) {
    return (
      <EmptyState
        icon={SearchX}
        title="Expense not found"
        action={<ButtonLink to="/">Back to my groups</ButtonLink>}
      />
    );
  }

  const isAdmin = me.role === "admin";
  const canManage = isAdmin || expense.createdBy === user._id;
  const category = categoryOf(expense.category);
  const position = myPosition(expense, me._id);
  const creatorName =
    group.members.find((member) => member.user?._id === expense.createdBy)?.name ?? "a former member";
  const listPath = `/groups/${group._id}/expenses`;

  const confirmDelete = async () => {
    setDeleteError("");
    try {
      await deleteExpense.mutateAsync(expense._id);
      toast.success("Expense deleted");
      setConfirmOpen(false);
      navigate(listPath, { replace: true });
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <Link
        to={listPath}
        className="-ml-1 inline-flex h-11 items-center gap-1.5 px-1 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to expenses
      </Link>

      <Card className="text-center">
        <span
          aria-hidden="true"
          className="inline-flex size-16 items-center justify-center rounded-3xl bg-white/5 text-3xl"
        >
          {category.emoji}
        </span>
        <h1 className="mt-3 break-words text-xl font-bold">{expense.description}</h1>
        <MoneyText value={expense.amount} currency={expense.currency} className="mt-1 block text-3xl font-bold" />
        <p className="mt-2 text-sm text-muted">
          {category.label} · {formatDay(expense.date)}
        </p>
        <p className="text-xs text-muted">Added by {creatorName}</p>
        <div className="mt-3">
          <PositionText position={position} currency={expense.currency} className="text-sm" />
        </div>
      </Card>

      {canManage && (
        <div className="flex flex-wrap gap-2">
          <ButtonLink to={`${listPath}/${expense._id}/edit`} variant="secondary">
            <Pencil className="size-4" /> Edit
          </ButtonLink>
          <Button
            variant="danger"
            onClick={() => {
              setDeleteError("");
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      )}

      <Card className="space-y-1">
        <h2 className="mb-2 font-semibold">Paid by</h2>
        <ul className="divide-y divide-line">
          {expense.paidBy.map((payer) => (
            <li key={payer.member} className="flex items-center gap-3 py-2.5">
              <Avatar name={lookup.name(payer.member)} src={lookup.get(payer.member)?.user?.avatar} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {payer.member === me._id ? "You" : lookup.name(payer.member)}
              </span>
              <MoneyText value={payer.amount} currency={expense.currency} className="text-sm" />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-1">
        <h2 className="font-semibold">Split</h2>
        <p className="mb-2 text-xs text-muted">{splitTypeLabel(expense.splitType)}</p>
        <ul className="divide-y divide-line">
          {expense.splits.map((s) => (
            <li key={s.member} className="flex items-center gap-3 py-2.5">
              <Avatar name={lookup.name(s.member)} src={lookup.get(s.member)?.user?.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {s.member === me._id ? "You" : lookup.name(s.member)}
                </p>
                {expense.splitType === "PERCENTAGE" && s.percentage != null && (
                  <p className="text-xs text-muted">{s.percentage}%</p>
                )}
                {expense.splitType === "SHARES" && s.shares != null && (
                  <p className="text-xs text-muted">
                    {s.shares} {s.shares === 1 ? "share" : "shares"}
                  </p>
                )}
              </div>
              <MoneyText value={s.owedAmount} currency={expense.currency} className="text-sm" />
            </li>
          ))}
        </ul>
      </Card>

      {expense.notes && (
        <Card>
          <h2 className="mb-1 font-semibold">Notes</h2>
          <p className="whitespace-pre-wrap break-words text-sm text-ink/90">{expense.notes}</p>
        </Card>
      )}

      <ReceiptSection expense={expense} canManage={canManage} />
      <CommentsSection expenseId={expense._id} userId={user._id} isAdmin={isAdmin} />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete this expense?"
        message="Everyone's balances will update. This can't be undone."
        confirmText="Delete"
        loading={deleteExpense.isPending}
        error={deleteError}
      />
    </div>
  );
}
