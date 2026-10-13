import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import { applyFieldErrors, getErrorMessage } from "@/api/errors";
import AuthLayout from "@/components/AuthLayout";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import PasswordInput from "@/components/ui/PasswordInput";
import PasswordRules from "@/features/auth/PasswordRules";
import { resetSchema } from "@/features/auth/schemas";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const linkClass = "text-violet-300 underline-offset-4 hover:text-white hover:underline";

export default function ResetPassword() {
  useDocumentTitle("Reset password");
  const params = useParams();
  const [searchParams] = useSearchParams();
  const token = params.token || searchParams.get("token") || "";
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const [linkProblem, setLinkProblem] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = async ({ password }) => {
    setFormError("");
    try {
      await authApi.resetPassword(token, password);
      toast.success("Password updated. Please log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      if (applyFieldErrors(error, setError, ["password"])) return;

      if (error.status === 400) setLinkProblem(true);
      setFormError(getErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before"
      badge="SPLITLY • SECURITY"
      footer={
        <Link to="/login" className={linkClass}>
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormAlert>{formError}</FormAlert>

        {linkProblem && (
          <p className="text-sm text-muted">
            <Link to="/forgot-password" className={linkClass}>
              Request a new reset link
            </Link>
          </p>
        )}

        <div className="space-y-2">
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            placeholder="Create a new password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordRules value={watch("password")} />
        </div>

        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          className="h-11 sm:h-12 bg-gradient-to-r from-blue-500 via-sky-500 to-blue-600 hover:from-blue-600 hover:to-sky-500 text-white shadow-lg shadow-blue-500/25 rounded-xl font-semibold"
        >
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
