export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* neeche fallback */
  }

  try {
    const host = document.querySelector("dialog[open]") ?? document.body;
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    host.appendChild(el);
    el.select();
    el.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    host.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

// "shared" | "cancelled" | "failed"
export async function shareLink({ title, text, url }) {
  try {
    await navigator.share({ title, text, url });
    return "shared";
  } catch (error) {
    return error?.name === "AbortError" ? "cancelled" : "failed";
  }
}
