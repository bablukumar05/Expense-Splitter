import { APP_NAME } from "@/lib/constants";

export const getInviteStatus = (invite) => {
  if (!invite.isActive) return "disabled";
  if (invite.expiresAt && new Date(invite.expiresAt) <= new Date()) return "expired";
  if (invite.maxUses != null && invite.usedCount >= invite.maxUses) return "full";
  return "active";
};

export const INVITE_STATUS = {
  active: { label: "Active", tone: "good", help: "" },
  disabled: { label: "Disabled", tone: "neutral", help: "This link is turned off. Turn it on below to let people join." },
  expired: { label: "Expired", tone: "warn", help: "This link has expired. Set a new expiry below or create a new link." },
  full: { label: "Limit reached", tone: "warn", help: "This link reached its join limit. Raise the limit below or create a new link." },
};

export const EXPIRY_PRESETS = [
  { value: "never", label: "Never expires", ms: null },
  { value: "1d", label: "24 hours from now", ms: 24 * 60 * 60 * 1000 },
  { value: "7d", label: "7 days from now", ms: 7 * 24 * 60 * 60 * 1000 },
  { value: "30d", label: "30 days from now", ms: 30 * 24 * 60 * 60 * 1000 },
];

export const MAX_USES_PRESETS = [1, 5, 10, 25, 50];

export const inviteMessage = (groupName) =>
  `Join "${groupName}" on ${APP_NAME} to split expenses together.`;
