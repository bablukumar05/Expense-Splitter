import { cn } from "@/lib/cn";

// variant "glass": bade surfaces. variant "flat": lists ke items (blur nahi, fast)
export default function Card({
  as: Tag = "div",
  variant = "glass",
  interactive = false,
  padded = true,
  className,
  ...props
}) {
  return (
    <Tag
      className={cn(
        "rounded-2xl",
        variant === "glass" ? "glass" : "border border-line bg-white/[0.04]",
        padded && "p-4 sm:p-5",
        interactive && "transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]",
        className
      )}
      {...props}
    />
  );
}
