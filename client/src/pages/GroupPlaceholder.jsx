import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";

export default function GroupPlaceholder() {
  const { groupId } = useParams();

  return (
    <Card>
      <h1 className="text-lg font-semibold">Group page (coming in Part 7.4)</h1>
      <p className="mt-2 break-all text-sm text-muted">Group id: {groupId}</p>
      <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-sm text-violet-300 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to home
      </Link>
    </Card>
  );
}
