import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import { usersApi } from "@/api/users";
import Card from "@/components/ui/Card";
import Switch from "@/components/ui/Switch";

export default function NotificationsCard({ user, updateUser }) {
  const [notifications, setNotifications] = useState(user?.emailNotifications ?? true);
  const [updating, setUpdating] = useState(false);

  const handleToggle = async (nextValue) => {
    setNotifications(nextValue);
    setUpdating(true);
    try {
      const updated = await usersApi.updateMe({ emailNotifications: nextValue });
      updateUser(updated?.user || updated || { ...user, emailNotifications: nextValue });
      toast.success(
        nextValue ? "Email notifications enabled" : "Email notifications disabled"
      );
    } catch (err) {
      setNotifications(!nextValue);
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-semibold text-ink">Notifications</h3>
        <p className="text-xs text-muted">Manage your email alerts and activity digest preferences.</p>
      </div>

      <div className="rounded-xl border border-line bg-white/[0.02] p-4">
        <Switch
          checked={notifications}
          onChange={handleToggle}
          disabled={updating}
          label="Email notifications"
          description="Receive email updates when someone adds an expense, records a payment, or invites you."
        />
      </div>
    </Card>
  );
}
