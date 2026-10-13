import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { setAccessToken } from "@/api/client";
import { getErrorMessage } from "@/api/errors";
import { usersApi } from "@/api/users";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PasswordInput from "@/components/ui/PasswordInput";
import PasswordRules from "@/features/auth/PasswordRules";
import { useLogout } from "@/features/auth/useLogout";
import { setRefreshToken } from "@/lib/storage";

export default function PasswordCard() {
  const logout = useLogout();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!currentPassword) {
      setErrorMsg("Please enter your current password");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await usersApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (res?.accessToken && res?.refreshToken) {
        setAccessToken(res.accessToken);
        setRefreshToken(res.refreshToken);
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.success("Password changed successfully. Please log in again.");
        await logout();
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="font-semibold text-ink">Change password</h3>
        <p className="text-xs text-muted">
          Update your login password. You may be asked to log in again after changing it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <PasswordInput
          label="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <div className="space-y-2">
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <PasswordRules password={newPassword} />
        </div>

        <PasswordInput
          label="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving}>
            <KeyRound className="mr-1.5 size-4" />
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}
