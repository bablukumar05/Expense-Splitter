export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadAvatarFile(file) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WEBP, and GIF images are allowed.");
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error("Direct image upload is not configured. Please paste an image URL directly.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || "Failed to upload image. Please try another image.");
  }

  const data = await response.json();
  return data.secure_url;
}
