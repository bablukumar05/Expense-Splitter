import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { applyFieldErrors, getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { GROUP_TYPES, typeEmoji } from "@/lib/constants";
import EmojiPicker from "./EmojiPicker";
import { useUpdateGroup } from "./hooks";
import { editGroupSchema } from "./schemas";

const FIELDS = ["name", "description", "type", "emoji"];

const toValues = (group) => ({
  name: group.name,
  description: group.description ?? "",
  type: group.type ?? "other",
  emoji: group.emoji || typeEmoji(group.type),
});

export default function EditGroupModal({ open, onClose, group }) {
  const update = useUpdateGroup(group._id);
  const [formError, setFormError] = useState("");

  const latest = useRef(group);
  useEffect(() => {
    latest.current = group;
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(editGroupSchema), defaultValues: toValues(group) });

  useEffect(() => {
    if (open) {
      reset(toValues(latest.current));
      setFormError("");
    }
  }, [open, reset]);

  const type = watch("type");
  const emoji = watch("emoji");

  const onSubmit = async (values) => {
    setFormError("");
    const initial = toValues(latest.current);
    const changes = {};
    for (const key of FIELDS) {
      if (values[key] !== initial[key]) changes[key] = values[key];
    }

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await update.mutateAsync(changes);
      toast.success("Group updated");
      onClose();
    } catch (error) {
      if (!applyFieldErrors(error, setError, FIELDS)) setFormError(getErrorMessage(error));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit group"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="edit-group-form" loading={isSubmitting}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="edit-group-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormAlert>{formError}</FormAlert>
        <Input label="Group name" autoComplete="off" error={errors.name?.message} {...register("name")} />
        <Textarea label="Description" rows={2} error={errors.description?.message} {...register("description")} />
        <SegmentedControl
          label="Group type"
          value={type}
          onChange={(value) => setValue("type", value)}
          options={GROUP_TYPES.map(({ value, label }) => ({ value, label }))}
        />
        <EmojiPicker value={emoji} onPick={(value) => setValue("emoji", value)} />
      </form>
    </Modal>
  );
}
