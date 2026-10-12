import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { applyFieldErrors, getErrorMessage } from "@/api/errors";
import AuthLayout from "@/components/AuthLayout";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { useAuth } from "@/features/auth/useAuth";
import PasswordRules from "@/features/auth/PasswordRules";
import { registerSchema } from "@/features/auth/schemas";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const linkClass = "text-violet-300 underline-offset-4 hover:text-white hover:underline";

export default function Register() {
  useDocumentTitle("Create account");
  const { signup } = useAuth();
  const location = useLocation();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setFormError("");
    try {

      await signup({ name: values.name, email: values.email, password: values.password });
    } catch (error) {
      if (error.status === 409) {
        setError("email", { type: "server", message: error.message });
      } else if (!applyFieldErrors(error, setError, ["name", "email", "password"])) {
        setFormError(getErrorMessage(error));
      }
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start splitting expenses in under a minute"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" state={location.state} className={linkClass}>
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormAlert>{formError}</FormAlert>

        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Your name"
          icon={User}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-2">
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordRules value={watch("password")} />
        </div>

        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" fullWidth loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
