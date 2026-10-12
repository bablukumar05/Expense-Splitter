import { LogOut } from "lucide-react";
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

      <Button variant="secondary" className="mt-6" onClick={logout}>
        <LogOut className="size-4" /> Log out
      </Button>
    </>
  );
}
