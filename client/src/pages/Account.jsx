import { useState } from "react";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "@/api/auth";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import InstallCard from "@/features/account/InstallCard";
import NotificationsCard from "@/features/account/NotificationsCard";
import PasswordCard from "@/features/account/PasswordCard";
import ProfileCard from "@/features/account/ProfileCard";
import { useAuth } from "@/features/auth/useAuth";
import { useLogout } from "@/features/auth/useLogout";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Account() {
  useDocumentTitle("Account");
  const { user, updateUser } = useAuth();
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
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <PageHeader
        title="Account"
        description="Manage your profile information, password, and preferences."
      />

      <ProfileCard user={user} updateUser={updateUser} />

      <NotificationsCard user={user} updateUser={updateUser} />

      <InstallCard />

      <PasswordCard />

      <Card className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <h4 className="font-semibold text-ink">Sign out</h4>
          <p className="text-xs text-muted">Sign out of your active session on this device.</p>
        </div>
        <Button variant="secondary" onClick={logout}>
          <LogOut className="mr-1.5 size-4" />
          Log out
        </Button>
      </Card>

      {import.meta.env.DEV && (
        <Card variant="flat" className="space-y-3">
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
    </div>
  );
}
