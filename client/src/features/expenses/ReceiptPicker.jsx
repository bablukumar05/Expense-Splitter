import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { ALLOWED_RECEIPT_TYPES, formatBytes } from "@/lib/image";

export default function ReceiptPicker({ file, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const handlePick = (event) => {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;

    if (!ALLOWED_RECEIPT_TYPES.includes(picked.type)) {
      setError("Only JPG, PNG or WEBP images are allowed.");
      return;
    }
    setError("");
    onChange(picked);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-ink/90">Receipt (optional)</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handlePick}
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-white/5 px-3 py-2">
          <Camera className="size-4 shrink-0 text-muted" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{file.name}</p>
            <p className="text-xs text-muted">{formatBytes(file.size)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onChange(null)} aria-label="Remove receipt">
            <X className="size-5" />
          </Button>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          <Camera className="size-4" /> Add receipt photo
        </Button>
      )}

      {error && <p className="text-xs text-bad">{error}</p>}
    </div>
  );
}
