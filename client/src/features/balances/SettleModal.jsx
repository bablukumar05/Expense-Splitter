import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import { buttonStyles } from "@/components/ui/button-styles";
import FormAlert from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import MoneyInput from "@/components/ui/MoneyInput";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import { toPaise } from "@/features/expenses/split";
import { APP_NAME } from "@/lib/constants";
import { currencySymbol, formatMoney, parseMoney, todayInputValue } from "@/lib/format";
import { useCreateSettlement } from "./hooks";
import {
  balancePaise,
  buildUpiLink,
  findRow,
  getSavedUpi,
  isValidUpiId,
  METHODS,
  pairMax,
  saveUpi,
  settleOptions,
  withSelected,
} from "./utils";

const rowLabel = (row, meId, currency) => {
  const paise = balancePaise(row);
  const who = `${row.name}${String(row.member) === String(meId) ? " (you)" : ""}`;
  if (paise < 0) return `${who} · owes ${formatMoney(-row.balance, currency)}`;
  if (paise > 0) return `${who} · is owed ${formatMoney(row.balance, currency)}`;
  return `${who} · settled up`;
};

function SettleDialog({ onClose, group, me, isAdmin, rows, prefill }) {
  const create = useCreateSettlement(group._id);
  const options = useMemo(() => settleOptions(rows, me._id, isAdmin), [rows, me._id, isAdmin]);
  const currency = group.currency;
  const symbol = currencySymbol(currency);
  const prefix = symbol.length <= 2 ? symbol : null;

  const [pointer] = useState(() => ({
    fine: window.matchMedia("(pointer: fine)").matches,
    coarse: window.matchMedia("(pointer: coarse)").matches,
  }));

  const [form, setForm] = useState(() => {
    const from = prefill?.from ?? options.froms[0]?.member ?? "";
    const to = prefill?.to ?? options.tos[0]?.member ?? "";
    const max = pairMax(findRow(rows, from), findRow(rows, to));
    return {
      from,
      to,
      amount: prefill?.amount != null ? String(prefill.amount) : max > 0 ? String(max / 100) : "",
      method: "cash",
      date: todayInputValue(),
      note: "",
      upiId: to ? getSavedUpi(to) : "",
    };
  });
  const [error, setError] = useState("");

  const change = (patch) => {
    setForm((current) => ({ ...current, ...patch }));
    setError("");
  };

  const changePair = (patch) => {
    const next = { ...form, ...patch };
    const max = pairMax(findRow(rows, next.from), findRow(rows, next.to));
    setForm({
      ...next,
      amount: max > 0 ? String(max / 100) : "",
      upiId: patch.to ? getSavedUpi(patch.to) : form.upiId,
    });
    setError("");
  };

  const fromRow = findRow(rows, form.from);
  const toRow = findRow(rows, form.to);
  const max = pairMax(fromRow, toRow);
  const amountPaise = toPaise(parseMoney(form.amount));
  const fromOptions = withSelected(options.froms, rows, form.from);
  const toOptions = withSelected(options.tos, rows, form.to);
  const unavailable = fromOptions.length === 0 || toOptions.length === 0;

  const upiId = form.upiId.trim();
  const showUpi = form.method === "upi" && currency === "INR" && form.from === me._id;
  const upiLink =
    showUpi && toRow && isValidUpiId(upiId) && amountPaise > 0 && amountPaise <= max
      ? buildUpiLink({
          upiId,
          name: toRow.name,
          amount: amountPaise / 100,
          note: `${APP_NAME} - ${group.name}`.slice(0, 50),
        })
      : null;

  const validate = () => {
    if (!fromRow || !toRow) return "Choose who paid and who received the money.";
    if (max === 0) {
      return balancePaise(fromRow) >= 0
        ? `${fromRow.name} doesn't owe anything right now.`
        : `${toRow.name} isn't owed anything right now.`;
    }
    if (!Number.isInteger(amountPaise) || amountPaise <= 0) return "Enter the amount that was paid.";
    if (amountPaise > max) {
      return `The most that can be recorded between ${fromRow.name} and ${toRow.name} is ${formatMoney(max / 100, currency)}.`;
    }
    if (form.date > todayInputValue()) return "Date can't be in the future.";
    return "";
  };

  const submit = async (event) => {
    event.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    try {
      await create.mutateAsync({
        from: form.from,
        to: form.to,
        amount: amountPaise / 100,
        method: form.method,
        date: form.date,
        ...(form.note.trim() ? { note: form.note.trim() } : {}),
      });
      if (form.method === "upi" && isValidUpiId(upiId)) saveUpi(form.to, upiId);
      toast.success("Payment recorded");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Record a payment"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="settle-form" loading={create.isPending} disabled={unavailable}>
            Record payment
          </Button>
        </>
      }
    >
      <form id="settle-form" onSubmit={submit} noValidate className="space-y-4">
        <p className="text-xs text-muted">
          This records a payment that already happened. No money moves through {APP_NAME}.
        </p>
        <FormAlert>{error}</FormAlert>

        {unavailable ? (
          <p className="rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-sm text-muted">
            There's nothing to settle right now.
          </p>
        ) : (
          <>
            <Select label="Who paid?" value={form.from} onChange={(e) => changePair({ from: e.target.value })}>
              {fromOptions.map((row) => (
                <option key={row.member} value={row.member}>
                  {rowLabel(row, me._id, currency)}
                </option>
              ))}
            </Select>

            <Select label="Who received it?" value={form.to} onChange={(e) => changePair({ to: e.target.value })}>
              {toOptions.map((row) => (
                <option key={row.member} value={row.member}>
                  {rowLabel(row, me._id, currency)}
                </option>
              ))}
            </Select>

            <div className="space-y-1">
              <MoneyInput
                label={`Amount (${currency})`}
                prefix={prefix}
                value={form.amount}
                onChange={(e) => change({ amount: e.target.value })}
                hint={
                  max > 0
                    ? `Up to ${formatMoney(max / 100, currency)} can be recorded between these two.`
                    : undefined
                }
                {...(pointer.fine ? { "data-autofocus": true } : {})}
              />
              {max > 0 && amountPaise !== max && (
                <Button size="sm" variant="ghost" onClick={() => change({ amount: String(max / 100) })}>
                  Use full amount ({formatMoney(max / 100, currency)})
                </Button>
              )}
            </div>

            <SegmentedControl
              label="Payment method"
              value={form.method}
              onChange={(method) => change({ method })}
              options={METHODS}
            />

            {showUpi && (
              <div className="space-y-2 rounded-xl border border-line bg-white/[0.03] p-3">
                <Input
                  label={`${toRow?.name ?? "Receiver"}'s UPI ID (optional)`}
                  placeholder="name@bank"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={form.upiId}
                  onChange={(e) => change({ upiId: e.target.value })}
                  error={upiId && !isValidUpiId(upiId) ? "Enter a valid UPI ID like name@bank" : undefined}
                  hint="Saved only on this device."
                />
                {pointer.coarse ? (
                  upiLink ? (
                    <a
                      href={upiLink}
                      onClick={() =>
                        toast.info("Finish the payment in your UPI app, then come back and tap Record payment.")
                      }
                      className={buttonStyles({ variant: "secondary", fullWidth: true })}
                    >
                      Pay {formatMoney(amountPaise / 100, "INR")} in UPI app
                    </a>
                  ) : (
                    <p className="text-xs text-muted">Enter a valid UPI ID and amount to open your UPI app.</p>
                  )
                ) : (
                  <p className="text-xs text-muted">
                    Open a UPI app on your phone to pay, then record the payment here.
                  </p>
                )}
              </div>
            )}

            <Input
              type="date"
              label="Date"
              max={todayInputValue()}
              value={form.date}
              onChange={(e) => change({ date: e.target.value })}
            />

            <Input
              label="Note (optional)"
              placeholder="Paid for the hotel"
              maxLength={200}
              autoComplete="off"
              value={form.note}
              onChange={(e) => change({ note: e.target.value })}
            />
          </>
        )}
      </form>
    </Modal>
  );
}

export default function SettleModal({ open, onClose, ...props }) {
  return open ? <SettleDialog onClose={onClose} {...props} /> : null;
}
