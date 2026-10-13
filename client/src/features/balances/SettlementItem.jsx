import { ArrowRightLeft, Undo2 } from "lucide-react";
import Button from "@/components/ui/Button";
import MoneyText from "@/components/ui/MoneyText";
import { formatDay } from "@/lib/format";
import { methodLabel } from "./utils";

export default function SettlementItem({ settlement, meId, currency, canUndo, onUndo }) {
  const youPaid = settlement.from === meId;
  const youGot = settlement.to === meId;

  const title = youPaid
    ? `You paid ${settlement.toName}`
    : youGot
      ? `${settlement.fromName} paid you`
      : `${settlement.fromName} paid ${settlement.toName}`;

  return (
    <li className="flex items-center gap-3 px-3.5 py-3">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
        <ArrowRightLeft className="size-4 text-violet-300" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted">
          {methodLabel(settlement.method)} · {formatDay(settlement.date)}
          {settlement.note ? ` · ${settlement.note}` : ""}
        </p>
      </div>

      <MoneyText value={settlement.amount} currency={currency} className="text-sm" />

      {canUndo && (
        <Button variant="ghost" size="icon" aria-label="Undo this payment" onClick={() => onUndo(settlement)}>
          <Undo2 className="size-4" />
        </Button>
      )}
    </li>
  );
}
