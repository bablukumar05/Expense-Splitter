import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Mail, MessageCircle, QrCode, RefreshCw, Share2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { buttonStyles } from "@/components/ui/button-styles";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FormAlert from "@/components/ui/FormAlert";
import { fieldBase, Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import Switch from "@/components/ui/Switch";
import { canNativeShare, copyToClipboard, shareLink } from "@/lib/clipboard";
import { cn } from "@/lib/cn";
import { formatDate, timeUntil } from "@/lib/format";
import {
  useInvite,
  useInviteByEmail,
  useRegenerateInvite,
  useUpdateInvite,
} from "./hooks";
import {
  EXPIRY_PRESETS,
  getInviteStatus,
  INVITE_STATUS,
  inviteMessage,
  MAX_USES_PRESETS,
} from "./invite";
import { inviteEmailSchema } from "./schemas";

function InviteContent({ group, invite }) {
  const status = getInviteStatus(invite);
  const meta = INVITE_STATUS[status];
  const live = status === "active";
  const message = inviteMessage(group.name);

  const updateInvite = useUpdateInvite(group._id);
  const regenerate = useRegenerateInvite(group._id);
  const sendEmail = useInviteByEmail(group._id);

  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [regenError, setRegenError] = useState("");
  const [saving, setSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  // Settings: "keep" matlab abhi ka expiry waisa hi rakho
  const currentMax = invite.maxUses == null ? "unlimited" : String(invite.maxUses);
  const [expiry, setExpiry] = useState("keep");
  const [maxUses, setMaxUses] = useState(currentMax);
  const dirty = expiry !== "keep" || maxUses !== currentMax;

  const maxOptions = [...new Set([...MAX_USES_PRESETS, ...(invite.maxUses ? [invite.maxUses] : [])])].sort(
    (a, b) => a - b
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(inviteEmailSchema), defaultValues: { email: "" } });

  const usageText =
    invite.maxUses != null
      ? `${invite.usedCount} of ${invite.maxUses} joins used`
      : `${invite.usedCount} ${invite.usedCount === 1 ? "person has" : "people have"} joined with this link`;

  const expiryText = invite.expiresAt
    ? status === "expired"
      ? `Expired on ${formatDate(invite.expiresAt)}`
      : `Expires ${timeUntil(invite.expiresAt)}`
    : "Never expires";

  const handleCopy = async () => {
    const ok = await copyToClipboard(invite.link);
    if (ok) {
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Couldn't copy automatically. Select the link and copy it.");
    }
  };

  const handleShare = async () => {
    const result = await shareLink({ title: group.name, text: message, url: invite.link });
    if (result === "failed") handleCopy(); // share na chale to kam se kam copy ho jaye
  };

  const toggleActive = async (next) => {
    try {
      await updateInvite.mutateAsync({ isActive: next });
      toast.success(next ? "Invite link enabled" : "Invite link disabled");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const saveSettings = async () => {
    setSettingsError("");
    const body = {};

    if (expiry !== "keep") {
      const preset = EXPIRY_PRESETS.find((item) => item.value === expiry);
      body.expiresAt = preset.ms ? new Date(Date.now() + preset.ms).toISOString() : null;
    }
    if (maxUses !== currentMax) {
      body.maxUses = maxUses === "unlimited" ? null : Number(maxUses);
    }

    setSaving(true);
    try {
      await updateInvite.mutateAsync(body);
      setExpiry("keep");
      toast.success("Invite settings saved");
    } catch (error) {
      setSettingsError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const confirmRegenerate = async () => {
    setRegenError("");
    try {
      await regenerate.mutateAsync();
      setMaxUses("unlimited");
      setExpiry("keep");
      setConfirmOpen(false);
      toast.success("New link created. The old link no longer works.");
    } catch (error) {
      setRegenError(getErrorMessage(error));
    }
  };

  const sendInviteEmail = async ({ email }) => {
    try {
      await sendEmail.mutateAsync(email);
      toast.success("If that email is valid, an invitation is on its way.");
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error)); // jaise: "Enable the invite link first"
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Link aur share */}
      <section aria-labelledby="invite-link-heading" className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 id="invite-link-heading" className="text-sm font-semibold">
            Invite link
          </h3>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
        <p className="text-xs text-muted">
          {usageText} · {expiryText}
        </p>

        <div className="flex gap-2">
          <input
            readOnly
            value={invite.link}
            aria-label="Invite link"
            onFocus={(event) => event.target.select()}
            className={cn(fieldBase, "h-11 min-w-0 flex-1 border-line px-3", !live && "opacity-60")}
          />
          <Button variant="secondary" size="icon" onClick={handleCopy} disabled={!live} aria-label="Copy invite link">
            {copied ? <Check className="size-5 text-good" /> : <Copy className="size-5" />}
          </Button>
        </div>

        {!live && <p className="text-xs text-warn">{meta.help}</p>}

        <div className={cn("grid gap-2", canNativeShare() ? "grid-cols-2" : "grid-cols-1")}>
          {canNativeShare() && (
            <Button onClick={handleShare} disabled={!live}>
              <Share2 className="size-4" /> Share
            </Button>
          )}
          {live ? (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${message}\n${invite.link}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "secondary" })}
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          ) : (
            <Button variant="secondary" disabled>
              <MessageCircle className="size-4" /> WhatsApp
            </Button>
          )}
        </div>

        {live && (
          <details className="rounded-xl border border-line bg-white/[0.03] p-3">
            <summary className="flex h-8 cursor-pointer items-center gap-2 text-sm font-medium">
              <QrCode className="size-4" aria-hidden="true" /> Show QR code
            </summary>
            <div className="mt-3 flex justify-center">
              {/* Safed background zaroori hai: dark theme mein QR scan nahi hota */}
              <div className="rounded-xl bg-white p-3">
                <QRCodeSVG value={invite.link} size={168} />
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted">Scan with a phone camera to open the invite.</p>
          </details>
        )}
      </section>

      {/* 2. Email se invite */}
      <section aria-labelledby="invite-email-heading" className="space-y-2">
        <h3 id="invite-email-heading" className="text-sm font-semibold">
          Invite by email
        </h3>
        <form onSubmit={handleSubmit(sendInviteEmail)} noValidate className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Input
              type="email"
              inputMode="email"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="friend@example.com"
              aria-label="Friend's email"
              icon={Mail}
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
          <Button type="submit" variant="secondary" loading={isSubmitting} disabled={!live}>
            Send
          </Button>
        </form>
        <p className="text-xs text-muted">
          {live
            ? "They'll get an email with the join link."
            : "Enable the invite link to send email invitations."}
        </p>
      </section>

      {/* 3. Settings */}
      <section
        aria-labelledby="invite-settings-heading"
        className="space-y-4 rounded-2xl border border-line bg-white/[0.03] p-4"
      >
        <h3 id="invite-settings-heading" className="text-sm font-semibold">
          Link settings
        </h3>

        <Switch
          checked={invite.isActive}
          onChange={toggleActive}
          disabled={updateInvite.isPending}
          label="Link enabled"
          description="Turn off to stop anyone from joining with this link."
        />

        <Select label="Expires" value={expiry} onChange={(e) => setExpiry(e.target.value)}>
          <option value="keep">
            Keep current ({invite.expiresAt ? `expires ${formatDate(invite.expiresAt)}` : "never expires"})
          </option>
          {EXPIRY_PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </Select>

        <Select
          label="Maximum joins"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          hint={
            maxUses !== "unlimited" && Number(maxUses) <= invite.usedCount
              ? `Already used ${invite.usedCount} times, so this link would stop working.`
              : undefined
          }
        >
          <option value="unlimited">Unlimited</option>
          {maxOptions.map((n) => (
            <option key={n} value={String(n)}>
              {n} {n === 1 ? "join" : "joins"}
            </option>
          ))}
        </Select>

        <FormAlert>{settingsError}</FormAlert>
        <Button fullWidth onClick={saveSettings} disabled={!dirty} loading={saving}>
          Save changes
        </Button>
      </section>

      {/* 4. Naya link */}
      <section aria-labelledby="invite-regen-heading" className="space-y-2">
        <h3 id="invite-regen-heading" className="text-sm font-semibold">
          Create a new link
        </h3>
        <p className="text-xs text-muted">
          If the link reached the wrong people, replace it. The old link stops working immediately.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            setRegenError("");
            setConfirmOpen(true);
          }}
        >
          <RefreshCw className="size-4" /> Create new link
        </Button>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmRegenerate}
        title="Replace the invite link?"
        message="The current link will stop working immediately, and the join counter resets. The new link is active right away."
        confirmText="Create new link"
        loading={regenerate.isPending}
        error={regenError}
      />
    </div>
  );
}

export default function InviteModal({ open, onClose, group }) {
  const invite = useInvite(group._id, open);

  return (
    <Modal open={open} onClose={onClose} title="Invite people">
      {/* Band hote hi content unmount: agli baar settings aur email field fresh khulte hain */}
      {open &&
        (invite.isPending ? (
          <div role="status" aria-label="Loading invite link" className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-28" />
          </div>
        ) : invite.data ? (
          <InviteContent group={group} invite={invite.data} />
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted">Couldn't load the invite link.</p>
            <Button variant="secondary" onClick={() => invite.refetch()}>
              Try again
            </Button>
          </div>
        ))}
    </Modal>
  );
}
