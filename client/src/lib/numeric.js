export function sanitizeDecimal(raw, { maxWhole = 8, maxFraction = 2 } = {}) {
  let value = raw.replace(/[^\d.]/g, "");
  if (value === "") return "";

  const firstDot = value.indexOf(".");
  if (firstDot !== -1) {
    value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, "");
  }

  const [whole, fraction] = value.split(".");
  const cleanWhole = whole === "" ? "0" : whole.replace(/^0+(?=\d)/, "").slice(0, maxWhole);
  return fraction !== undefined ? `${cleanWhole}.${fraction.slice(0, maxFraction)}` : cleanWhole;
}

export const sanitizeInteger = (raw, maxDigits = 4) =>
  raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, maxDigits);
