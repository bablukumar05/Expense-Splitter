import { useRef, useState } from "react";
import { Link2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { uploadAvatarFile } from "@/lib/avatarUpload";

export default function AvatarField({ value, onChange, name }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadAvatarFile(file);
      onChange(url);
      toast.success("Avatar image uploaded");
    } catch (err) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
        Profile photo
      </label>

      <div className="flex items-center gap-4">
        <Avatar src={value} name={name} size="xl" className="shrink-0 ring-2 ring-line" />

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
          >
            <Upload className="mr-1.5 size-3.5" />
            Upload photo
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUrlInput((prev) => !prev)}
          >
            <Link2 className="mr-1.5 size-3.5" />
            {showUrlInput ? "Hide URL" : "Enter URL"}
          </Button>

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-rose-400 hover:text-rose-300"
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {showUrlInput && (
        <div className="pt-1">
          <Input
            placeholder="https://example.com/avatar.jpg"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            type="url"
          />
        </div>
      )}
    </div>
  );
}
