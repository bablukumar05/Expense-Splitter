import { Link, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";

export default function JoinPlaceholder() {
  const { code } = useParams();
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <Card>
        <h1 className="text-lg font-semibold">Join page (coming in Part 7.4)</h1>
        <p className="mt-2 break-all text-sm text-muted">Invite code: {code}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-violet-300 hover:underline">
          Back to dashboard
        </Link>
      </Card>
    </main>
  );
}
