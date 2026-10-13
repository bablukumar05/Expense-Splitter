export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function filenameFromDisposition(header) {
  if (!header) return null;
  const star = /filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""));
    } catch {
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : null;
}

export function safeFilename(headerName, base, extension) {
  const clean = (text) => text.replace(/[\\/:*?"<>|\r\n]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 100);
  const name = clean(headerName || `${base}.${extension}`);
  return name.toLowerCase().endsWith(`.${extension}`) ? name : `${name}.${extension}`;
}
