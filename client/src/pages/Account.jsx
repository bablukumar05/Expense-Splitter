import { useState } from "react";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "@/api/auth";
import PageHeader from "@/components/layout/PageHeader";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/features/auth/useAuth";
import { useLogout } from "@/features/auth/useLogout";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Account() {
  useDocumentTitle("Account");
  const { user } = useAuth();
  const logout = useLogout();
  const [debug, setDebug] = useState("");

  const callMe = async () => {
    try {
      const data = await authApi.me();
      setDebug(`OK: ${data.user.email}`);
    } catch (error) {
      setDebug(`FAILED: ${error.message}`);
    }
  };

  return (
    <>
      <PageHeader title="Account" subtitle="Your profile and preferences" />

      <Card className="flex items-center gap-4">
        <Avatar name={user?.name} src={user?.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{user?.name}</h2>
          <p className="truncate text-sm text-muted">{user?.email}</p>
          <Badge className="mt-2">Default currency: {user?.defaultCurrency || "INR"}</Badge>
        </div>
      </Card>

      <p className="mt-4 text-sm text-muted">
        Edit profile, change password and notification settings arrive in Part 7.7.
      </p>

      <Button variant="secondary" className="mt-6" onClick={logout}>
        <LogOut className="size-4" /> Log out
      </Button>

      {import.meta.env.DEV && (
        <Card variant="flat" className="mt-8 space-y-3">
          <p className="text-sm font-medium">Dev tools</p>
          <div className="flex flex-wrap items-center gap-3">
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
    </>
  );
}
