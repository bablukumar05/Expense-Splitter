import { useState } from "react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const gradients = [
  "from-violet-500 to-indigo-500",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-pink-500 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-fuchsia-500 to-purple-500",
];

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
};

const pick = (name = "") =>
  gradients[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % gradients.length];

export default function Avatar({ name, src, size = "md", className }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        className={cn("shrink-0 rounded-full object-cover", sizes[size], className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-linear-to-br font-semibold text-white",
        pick(name),
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
