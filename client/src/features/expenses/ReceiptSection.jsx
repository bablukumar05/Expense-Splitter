import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import { prepareReceipt, receiptThumb } from "@/lib/image";
import { useRemoveReceipt, useUploadReceipt } from "./hooks";

export default function ReceiptSection({ expense, canManage }) {
  const upload = useUploadReceipt(expense._id);
  const remove = useRemoveReceipt(expense._id);
  const inputRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    try {
      const prepared = await prepareReceipt(file);
      await upload.mutateAsync(prepared);
      setImageFailed(false);
      toast.success("Receipt uploaded");
    } catch (error) {
      toast.error(getErrorMessage(error, error?.message));
    } finally {
      setBusy(false);
    }
  };

  const confirmRemove = async () => {
    setRemoveError("");
    try {
      await remove.mutateAsync();
      setConfirmOpen(false);
      toast.success("Receipt removed");
    } catch (error) {
      setRemoveError(getErrorMessage(error));
    }
  };

  const hasReceipt = Boolean(expense.receiptUrl);
  if (!hasReceipt && !canManage) return null;

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">Receipt</h2>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {hasReceipt ? (
        <>
          {imageFailed ? (
            <p className="text-sm text-muted">Couldn't load the receipt image.</p>
          ) : (
            <button
              type="button"
              onClick={() => setViewOpen(true)}
              aria-label="View receipt full size"
              className="block w-full overflow-hidden rounded-xl border border-line"
            >
              <img
                src={receiptThumb(expense.receiptUrl)}
                alt="Receipt"
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="max-h-72 w-full object-cover"
              />
            </button>
          )}

          {canManage && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" loading={busy} onClick={() => inputRef.current?.click()}>
                <Camera className="size-4" /> Replace
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={busy}
                onClick={() => {
                  setRemoveError("");
                  setConfirmOpen(true);
                }}
              >
                <Trash2 className="size-4" /> Remove
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-muted">No receipt attached yet.</p>
          <Button variant="secondary" loading={busy} onClick={() => inputRef.current?.click()}>
            <Camera className="size-4" /> Add receipt photo
          </Button>
        </>
      )}

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Receipt">
        <img src={expense.receiptUrl} alt="Receipt" className="max-h-[70dvh] w-full rounded-xl object-contain" />
        <a
          href={expense.receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm text-violet-300 underline-offset-4 hover:underline"
        >
          Open original
        </a>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmRemove}
        title="Remove receipt?"
        message="The receipt photo will be deleted from this expense."
        confirmText="Remove"
        loading={remove.isPending}
        error={removeError}
      />
    </Card>
  );
}
