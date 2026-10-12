import { cn } from "@/lib/cn";

export default function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-xl", className)} />;
}
