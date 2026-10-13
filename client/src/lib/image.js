export const ALLOWED_RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_BYTES = 5 * 1024 * 1024;
const SKIP_COMPRESS_BELOW = 1024 * 1024;
const MAX_SIDE = 1600;

const toJpgName = (name) => `${name.replace(/\.[^.]+$/, "")}.jpg`;

export async function prepareReceipt(file) {
  if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG or WEBP images are allowed.");
  }
  if (file.size <= SKIP_COMPRESS_BELOW) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (blob && blob.size < file.size) {
      return new File([blob], toJpgName(file.name), { type: "image/jpeg" });
    }
  } catch {
  }

  if (file.size > MAX_BYTES) {
    throw new Error("This image is larger than 5 MB. Please choose a smaller photo.");
  }
  return file;
}

export const receiptThumb = (url) =>
  url.includes("/image/upload/")
    ? url.replace("/image/upload/", "/image/upload/w_900,c_limit,q_auto,f_auto/")
    : url;

export const formatBytes = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
