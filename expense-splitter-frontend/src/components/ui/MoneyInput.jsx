import { forwardRef } from "react";
import { Input } from "./Input";

const sanitize = (raw) => {
  let v = raw.replace(/[^\d.]/g, ""); // sirf digits aur dot
  if (v === "") return "";

  const firstDot = v.indexOf(".");
  if (firstDot !== -1) {
    // doosra dot hata do
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
  }

  const [whole, frac] = v.split(".");
  const cleanWhole = whole === "" ? "0" : whole.replace(/^0+(?=\d)/, "").slice(0, 8);
  return frac !== undefined ? `${cleanWhole}.${frac.slice(0, 2)}` : cleanWhole;
};

const MoneyInput = forwardRef(function MoneyInput({ onChange, prefix = "₹", ...props }, ref) {
  const handleChange = (e) => {
    e.target.value = sanitize(e.target.value); // pehle saaf karo, phir form library ko do
    onChange?.(e);
  };

  return (
    <Input
      ref={ref}
      inputMode="decimal"
      autoComplete="off"
      placeholder="0.00"
      prefix={prefix}
      onChange={handleChange}
      {...props}
    />
  );
});

export default MoneyInput;
