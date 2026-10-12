// "https://app.com/join/abc123..." ya seedha "abc123..." => code
export const parseInviteCode = (input) => {
  const value = input.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    const match = url.pathname.match(/\/join\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    // URL nahi hai: seedha code maano. Backend ka code base64url hota hai (10 se 64 characters)
    return /^[A-Za-z0-9_-]{10,64}$/.test(value) ? value : null;
  }
};
