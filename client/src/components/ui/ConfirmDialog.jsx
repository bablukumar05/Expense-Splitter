import Button from "./Button";
import FormAlert from "./FormAlert";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  tone = "danger",
  loading = false,
  error = "",
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {message && <p className="text-sm text-muted">{message}</p>}
        {children}
        <FormAlert>{error}</FormAlert>
      </div>
    </Modal>
  );
}
