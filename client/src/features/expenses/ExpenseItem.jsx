import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import MoneyText from "@/components/ui/MoneyText";
import { cn } from "@/lib/cn";
import { categoryOf } from "@/lib/constants";
import { formatDay, formatMoney } from "@/lib/format";
import { myPosition } from "./split";

export function PositionText({ position, currency, className }) {
  if (!position.involved) {
    return <span className={cn("text-xs text-muted", className)}>not involved</span>;
  }
  if (position.net === 0) {
    return <span className={cn("text-xs text-muted", className)}>no balance</span>;
  }
  const lent = position.net > 0;
  return (
    <span className={cn("text-xs", lent ? "text-good" : "text-bad", className)}>
      {lent ? "you lent" : "you borrowed"} {formatMoney(Math.abs(position.net) / 100, currency)}
    </span>
  );
}

export default function ExpenseItem({ expense, groupId, meId, lookup }) {
  const category = categoryOf(expense.category);
  const payers = expense.paidBy;

  const payerText =
    payers.length === 1
      ? payers[0].member === meId
        ? "You paid"
        : `${lookup.name(payers[0].member)} paid`
      : `${payers.length} people paid`;

  return (
    <Card
      as={Link}
      to={`/groups/${groupId}/expenses/${expense._id}`}
      variant="flat"
      interactive
      padded={false}
      className="flex items-center gap-3 p-3.5"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xl"
      >
        {category.emoji}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{expense.description}</p>
        <p className="truncate text-xs text-muted">
          {payerText} · {formatDay(expense.date)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <MoneyText value={expense.amount} currency={expense.currency} />
        <div>
          <PositionText position={myPosition(expense, meId)} currency={expense.currency} />
        </div>
      </div>
    </Card>
  );
}
