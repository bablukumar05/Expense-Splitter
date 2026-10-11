import { CloudOff } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/features/auth/useAuth";
import FullPageLoader from "./FullPageLoader";

export default function ProtectedRoute() {
  const { status, retry } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPageLoader label="Loading your account…" />;

  if (status === "error") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <EmptyState
          icon={CloudOff}
          title="Can't reach the server"
          description="Your session is safe. Check your connection and try again."
          action={<Button onClick={retry}>Try again</Button>}
        />
      </main>
    );
  }

  if (status === "unauthenticated") {
    // from: login ke baad yahin wapas aane ke liye
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
