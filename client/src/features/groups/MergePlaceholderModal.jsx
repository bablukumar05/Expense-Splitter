import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { useMergePlaceholder } from "./hooks";

export default function MergePlaceholderModal({ open, onClose, group, placeholder }) {
  const merge = useMergePlaceholder(group._id);
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");

  const targets = group.members.filter((member) => !member.isPlaceholder);

  useEffect(() => {
    if (!open) {
      setTarget("");
      setError("");
    }
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    if (!target) {
      setError("Choose which member this person is.");
      return;
    }
    setError("");

    try {
      await merge.mutateAsync({ placeholderId: placeholder._id, memberId: target });
      const targetName = targets.find((member) => member._id === target)?.name ?? "the member";
      toast.success(`${placeholder.name} merged into ${targetName}`);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Merge ${placeholder?.name ?? "placeholder"}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={merge.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="merge-placeholder-form" loading={merge.isPending}>
            Merge
          </Button>
        </>
      }
    >
      <form id="merge-placeholder-form" onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-muted">
          All of {placeholder?.name}'s expenses and payments will move to the member you choose.{" "}
          <strong className="text-ink">This can't be undone.</strong>
        </p>
        <FormAlert>{error}</FormAlert>
        <Select label="This person is…" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Select a member</option>
          {targets.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  );
}
