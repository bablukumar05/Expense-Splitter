import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { applyFieldErrors, getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Select from "@/components/ui/Select";
import { useAuth } from "@/features/auth/useAuth";
import { CURRENCIES, GROUP_TYPES, typeEmoji } from "@/lib/constants";
import EmojiPicker from "./EmojiPicker";
import { useCreateGroup } from "./hooks";
import { createGroupSchema } from "./schemas";

const FIELDS = ["name", "description", "currency", "type", "emoji"];

export default function CreateGroupModal({ open, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createGroup = useCreateGroup();
  const [formError, setFormError] = useState("");
  const [emojiPicked, setEmojiPicked] = useState(false);

  const defaultCurrency = user?.defaultCurrency || "INR";
  // User ki default currency list mein na ho to bhi dikhe
  const currencies = CURRENCIES.some((c) => c.code === defaultCurrency)
    ? CURRENCIES
    : [{ code: defaultCurrency, label: defaultCurrency }, ...CURRENCIES];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: "", description: "", currency: defaultCurrency, type: "trip", emoji: typeEmoji("trip") },
  });

  const type = watch("type");
  const emoji = watch("emoji");

  // Modal band hote hi form saaf, agli baar fresh khule
  useEffect(() => {
    if (!open) {
      reset();
      setFormError("");
      setEmojiPicked(false);
    }
  }, [open, reset]);

  const handleTypeChange = (value) => {
    setValue("type", value);
    if (!emojiPicked) setValue("emoji", typeEmoji(value));
  };

  const handleEmojiPick = (value) => {
    setValue("emoji", value);
    setEmojiPicked(true);
  };

  const onSubmit = async (values) => {
    setFormError("");
    try {
      const { group } = await createGroup.mutateAsync({
        name: values.name,
        ...(values.description ? { description: values.description } : {}),
        currency: values.currency,
        type: values.type,
        emoji: values.emoji,
      });
      toast.success(`"${group.name}" created`);
      onClose();
      navigate(`/groups/${group._id}`);
    } catch (error) {
      if (!applyFieldErrors(error, setError, FIELDS)) setFormError(getErrorMessage(error));
    }
  };

  const canAutofocus = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a group"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-group-form" loading={isSubmitting}>
            Create group
          </Button>
        </>
      }
    >
      <form id="create-group-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormAlert>{formError}</FormAlert>

        <Input
          label="Group name"
          placeholder="Goa Trip"
          autoComplete="off"
          error={errors.name?.message}
          {...(canAutofocus ? { "data-autofocus": true } : {})}
          {...register("name")}
        />

        <Textarea
          label="Description (optional)"
          placeholder="Dec 2026, 5 friends"
          rows={2}
          error={errors.description?.message}
          {...register("description")}
        />

        <SegmentedControl
          label="Group type"
          value={type}
          onChange={handleTypeChange}
          options={GROUP_TYPES.map(({ value, label }) => ({ value, label }))}
        />

        <EmojiPicker value={emoji} onPick={handleEmojiPick} />

        <Select label="Currency" error={errors.currency?.message} {...register("currency")}>
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </Select>
      </form>
    </Modal>
  );
}
