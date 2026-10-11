import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description="The page you're looking for doesn't exist or was moved."
        action={
          <Link to="/">
            <Button>Go home</Button>
          </Link>
        }
      />
    </main>
  );
}
