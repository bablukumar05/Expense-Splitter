import { useState } from "react";
import { LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/features/auth/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Dashboard() {
  useDocumentTitle("Dashboard");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [debug, setDebug] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const callMe = async () => {
    try {
      const data = await authApi.me();
      setDebug(`OK: ${data.user.email}`);
    } catch (error) {
      setDebug(`FAILED: ${error.message}`);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Card className="flex items-center gap-4">
        <Avatar name={user?.name ?? "User"} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold">Hi, {user?.name}</h1>
          <p className="truncate text-sm text-muted">{user?.email}</p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut className="size-4" /> Log out
        </Button>
      </Card>

      <p className="mt-6 text-sm text-muted">Groups and expenses arrive in Part 7.3.</p>

      {import.meta.env.DEV && (
        <Card variant="flat" className="mt-6 space-y-3">
          <p className="text-sm font-medium">Dev tools</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={callMe}>
              Call /auth/me
            </Button>
            <Link to="/design" className="text-sm text-violet-300 hover:underline">
              Design preview
            </Link>
          </div>
          {debug && <p className="text-xs text-muted">{debug}</p>}
        </Card>
      )}
    </main>
  );
}
