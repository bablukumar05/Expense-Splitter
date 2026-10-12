
export const parseInviteCode = (input) => {
  const value = input.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    const match = url.pathname.match(/\/join\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {

    return /^[A-Za-z0-9_-]{10,64}$/.test(value) ? value : null;
  }
};
