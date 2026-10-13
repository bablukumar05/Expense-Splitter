import { ChevronDown } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import MoneyText from "@/components/ui/MoneyText";
import { balancePaise } from "./utils";

function Stat({ label, value, currency }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd>
        <MoneyText value={value} currency={currency} className="text-sm font-medium" />
      </dd>
    </div>
  );
}

export default function BalanceRow({ row, isMe, currency }) {
  const paise = balancePaise(row);
  const status = paise > 0 ? "gets back" : paise < 0 ? "owes" : "settled up";

  return (
    <li>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-3.5 py-3 [&::-webkit-details-marker]:hidden">
          <Avatar name={row.name} />

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              {row.name}
              {isMe && <span className="ml-1.5 text-xs font-normal text-muted">(you)</span>}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              {row.isPlaceholder && <Badge tone="warn">Placeholder</Badge>}
              {!row.isActive && <Badge>Left the group</Badge>}
              <span>{status}</span>
            </div>
          </div>

          <MoneyText value={row.balance} currency={currency} signed />
          <ChevronDown
            className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pb-3.5 pl-[4.125rem] pr-3.5 text-xs">
          <Stat label="Paid for the group" value={row.paid} currency={currency} />
          <Stat label="Their share of expenses" value={row.owed} currency={currency} />
          <Stat label="Payments sent" value={row.settledPaid} currency={currency} />
          <Stat label="Payments received" value={row.settledReceived} currency={currency} />
        </dl>
      </details>
    </li>
  );
}
