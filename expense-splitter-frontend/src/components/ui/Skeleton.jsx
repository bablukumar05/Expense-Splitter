import { cn } from "@/lib/cn";

// Data aane tak "loading" ki shape dikhane ke liye (spinner se behtar UX)
export default function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-xl", className)} />;
}
