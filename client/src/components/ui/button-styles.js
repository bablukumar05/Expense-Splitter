import { cn } from "@/lib/cn";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-brand-gradient text-white shadow-glow hover:brightness-110",
  secondary: "border border-line bg-white/5 text-ink hover:bg-white/10",
  ghost: "text-muted hover:bg-white/5 hover:text-ink",
  danger: "border border-bad/30 bg-bad/15 text-bad hover:bg-bad/25",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11",
};

export const buttonStyles = ({ variant = "primary", size = "md", fullWidth = false, className } = {}) =>
  cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
