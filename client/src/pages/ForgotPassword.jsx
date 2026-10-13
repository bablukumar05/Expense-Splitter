import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { authApi } from "@/api/auth";
import { getErrorMessage } from "@/api/errors";
import AuthLayout from "@/components/AuthLayout";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import FormAlert from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { forgotSchema } from "@/features/auth/schemas";
import { useCountdown } from "@/hooks/useCountdown";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const linkClass = "text-violet-300 underline-offset-4 hover:text-white hover:underline";

export default function ForgotPassword() {
  useDocumentTitle("Forgot password");
  const [sentTo, setSentTo] = useState("");
  const [formError, setFormError] = useState("");
  const [cooldown, startCooldown] = useCountdown();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const send = async ({ email }) => {
    setFormError("");
    try {
      await authApi.forgotPassword(email);
      setSentTo(email);
      startCooldown(30);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  const footer = (
    <Link to="/login" className={`inline-flex items-center gap-1.5 ${linkClass}`}>
      <ArrowLeft className="size-4" aria-hidden="true" /> Back to log in
    </Link>
  );

  if (sentTo) {
    return (
      <AuthLayout title="Check your inbox" footer={footer}>
        <EmptyState
          icon={Mail}
          title="Reset link sent"
          description={`If an account exists for ${sentTo}, we've sent a link that works for 15 minutes.`}
          action={
            <Button variant="secondary" disabled={cooldown > 0} onClick={() => send({ email: sentTo })}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
            </Button>
          }
        />
        <FormAlert>{formError}</FormAlert>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      badge="SPLITLY • RECOVERY"
      footer={footer}
    >
      <form onSubmit={handleSubmit(send)} noValidate className="space-y-4">
        <FormAlert>{formError}</FormAlert>

        <Input
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="name@email.com"
          icon={Mail}
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          className="h-11 sm:h-12 bg-gradient-to-r from-blue-500 via-sky-500 to-blue-600 hover:from-blue-600 hover:to-sky-500 text-white shadow-lg shadow-blue-500/25 rounded-xl font-semibold"
        >
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
}
