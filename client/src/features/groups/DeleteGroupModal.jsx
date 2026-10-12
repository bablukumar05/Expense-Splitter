import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useDeleteGroup, useRestoreGroup } from "./hooks";

export default function DeleteGroupModal({ open, onClose, group }) {
  const navigate = useNavigate();
  const deleteGroup = useDeleteGroup();
  const restoreGroup = useRestoreGroup();
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setTyped("");
      setError("");
    }
  }, [open]);

  const matches = typed.trim() === group.name;

  const undo = () => {
    restoreGroup
      .mutateAsync(group._id)
      .then(() => toast.success(`"${group.name}" restored`))
      .catch((err) => toast.error(getErrorMessage(err)));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!matches) return;
    setError("");

    try {
      await deleteGroup.mutateAsync(group._id);
      onClose();
      navigate("/", { replace: true });
      toast(`"${group.name}" was deleted`, {
        duration: 10_000,
        action: { label: "Undo", onClick: undo },
      });
    } catch (err) {
      setError(getErrorMessage(err)); // jaise: "Settle all balances before deleting the group"
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete group?"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={deleteGroup.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="delete-group-form" variant="danger" disabled={!matches} loading={deleteGroup.isPending}>
            Delete group
          </Button>
        </>
      }
    >
      <form id="delete-group-form" onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-muted">
          This removes <strong className="text-ink">{group.name}</strong> for everyone. All balances must be settled
          first. You can undo right after deleting, and an admin can restore it within 30 days.
        </p>
        <FormAlert>{error}</FormAlert>
        <Input
          label={`Type "${group.name}" to confirm`}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />
      </form>
    </Modal>
  );
}
