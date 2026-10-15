import { toPaise } from "@/features/expenses/split";

export const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank" },
  { value: "other", label: "Other" },
];

export const methodLabel = (value) => METHODS.find((method) => method.value === value)?.label ?? "Other";

export const findRow = (rows, id) => rows.find((row) => String(row.member) === String(id));

export const balancePaise = (row) => toPaise(row.balance);

export function pairMax(fromRow, toRow) {
  if (!fromRow || !toRow) return 0;
  const fromNet = balancePaise(fromRow);
  const toNet = balancePaise(toRow);
  if (fromNet >= 0 || toNet <= 0) return 0;
  return Math.min(-fromNet, toNet);
}

export function settleOptions(rows, meId, isAdmin) {
  const active = rows.filter((row) => row.isActive);
  const debtors = active.filter((row) => balancePaise(row) < 0);
  const creditors = active.filter((row) => balancePaise(row) > 0);

  if (isAdmin) return { froms: debtors, tos: creditors };

  const mine = active.find((row) => String(row.member) === String(meId));
  if (!mine) return { froms: [], tos: [] };
  if (balancePaise(mine) < 0) return { froms: [mine], tos: creditors };
  if (balancePaise(mine) > 0) return { froms: debtors, tos: [mine] };
  return { froms: [], tos: [] };
}

export const canRecordPayment = (options) => options.froms.length > 0 && options.tos.length > 0;

export function withSelected(list, rows, id) {
  if (!id || list.some((row) => String(row.member) === String(id))) return list;
  const selected = findRow(rows, id);
  return selected ? [...list, selected] : list;
}

export const isValidUpiId = (value) => /^[A-Za-z0-9._-]{2,256}@[A-Za-z][A-Za-z0-9]{1,63}$/.test(value);

export function buildUpiLink({ upiId, name, amount, note }) {
  const params = [`pa=${upiId}`, `pn=${encodeURIComponent(name)}`, `am=${amount.toFixed(2)}`, "cu=INR"];
  if (note) params.push(`tn=${encodeURIComponent(note)}`);
  return `upi://pay?${params.join("&")}`;
}

const upiKey = (memberId) => `splitmate.upi.${memberId}`;
const legacyUpiKey = (memberId) => `splitly.upi.${memberId}`;

export const getSavedUpi = (memberId) => {
  try {
    return localStorage.getItem(upiKey(memberId)) ?? localStorage.getItem(legacyUpiKey(memberId)) ?? "";
  } catch {
    return "";
  }
};

export const saveUpi = (memberId, value) => {
  try {
    localStorage.setItem(upiKey(memberId), value);
  } catch {
  }
};
