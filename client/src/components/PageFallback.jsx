import Skeleton from "@/components/ui/Skeleton";

export default function PageFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="animate-fade-in space-y-4"
      style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
    >
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-40" />
      <Skeleton className="h-24" />
    </div>
  );
}
