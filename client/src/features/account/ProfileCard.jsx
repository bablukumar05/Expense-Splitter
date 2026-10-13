import { useState } from "react";
import { Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import { usersApi } from "@/api/users";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { CURRENCIES } from "@/lib/constants";
import AvatarField from "./AvatarField";

export default function ProfileCard({ user, updateUser }) {
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [currency, setCurrency] = useState(user?.defaultCurrency || "INR");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        avatar: avatar.trim() || null,
        defaultCurrency: currency,
      };
      const updated = await usersApi.updateMe(payload);
      updateUser(updated?.user || updated || { ...user, ...payload });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="font-semibold text-ink">Personal details</h3>
        <p className="text-xs text-muted">Update your photo, display name, and preferred currency.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AvatarField value={avatar} onChange={setAvatar} name={name} />

        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <Input
            label="Email address"
            value={user?.email || ""}
            disabled
            startIcon={<Mail className="size-4 text-muted" />}
          />
          <p className="mt-1 text-xs text-muted">Your email is verified and cannot be changed.</p>
        </div>

        <Select
          label="Default currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </Select>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving}>
            <Check className="mr-1.5 size-4" />
            Save profile
          </Button>
        </div>
      </form>
    </Card>
  );
}
