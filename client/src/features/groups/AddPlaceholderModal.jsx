import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { applyFieldErrors, getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useAddPlaceholder } from "./hooks";
import { placeholderSchema } from "./schemas";

export default function AddPlaceholderModal({ open, onClose, group }) {
  const addPlaceholder = useAddPlaceholder(group._id);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(placeholderSchema), defaultValues: { name: "" } });

  useEffect(() => {
    if (!open) {
      reset();
      setFormError("");
    }
  }, [open, reset]);

  const onSubmit = async ({ name }) => {
    setFormError("");
    try {
      await addPlaceholder.mutateAsync(name);
      toast.success(`${name} added to the group`);
      onClose();
    } catch (error) {
      if (error.status === 409) setError("name", { type: "server", message: error.message });
      else if (!applyFieldErrors(error, setError, ["name"])) setFormError(getErrorMessage(error));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a placeholder"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="add-placeholder-form" loading={isSubmitting}>
            Add
          </Button>
        </>
      }
    >
      <form id="add-placeholder-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <p className="text-sm text-muted">
          A placeholder is a friend who isn't on the app yet. You can add expenses for them now and merge them into
          their real account once they join.
        </p>
        <FormAlert>{formError}</FormAlert>
        <Input
          label="Name"
          placeholder="Rahul"
          icon={User}
          autoComplete="off"
          error={errors.name?.message}
          data-autofocus
          {...register("name")}
        />
      </form>
    </Modal>
  );
}
