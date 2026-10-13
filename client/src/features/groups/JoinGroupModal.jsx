import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

import { parseInviteCode } from "./invite";

export default function JoinGroupModal({ open, onClose }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setValue("");
      setError("");
    }
  }, [open]);

  const submit = (event) => {
    event.preventDefault();
    const code = parseInviteCode(value);
    if (!code) {
      setError("That doesn't look like an invite link or code.");
      return;
    }
    onClose();
    navigate(`/join/${encodeURIComponent(code)}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Join a group"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="join-group-form">
            Continue
          </Button>
        </>
      }
    >
      <form id="join-group-form" onSubmit={submit} noValidate>
        <Input
          label="Invite link or code"
          placeholder="Paste the link you received"
          icon={Link2}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          error={error}
        />
      </form>
    </Modal>
  );
}
