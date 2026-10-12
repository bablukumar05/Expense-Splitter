import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { applyFieldErrors, getErrorMessage } from "@/api/errors";
import AuthLayout from "@/components/AuthLayout";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { useAuth } from "@/features/auth/useAuth";
import { loginSchema } from "@/features/auth/schemas";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;
const linkClass = "text-violet-300 underline-offset-4 hover:text-white hover:underline";

export default function Login() {
  useDocumentTitle("Log in");
  const { login } = useAuth();
  const location = useLocation();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setFormError("");
    try {
      await login(values);
    } catch (error) {

      if (!applyFieldErrors(error, setError, ["email", "password"])) {
        setFormError(getErrorMessage(error));
      }
    }
  };

  const useDemo = () => {
    setValue("email", demoEmail);
    setValue("password", demoPassword);
    handleSubmit(onSubmit)();
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to split expenses with your groups"
      footer={
        <>
          New here?{" "}

          <Link to="/register" state={location.state} className={linkClass}>
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormAlert>{formError}</FormAlert>

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

        <div className="space-y-1.5">
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="text-right">
            <Link to="/forgot-password" className={`text-sm ${linkClass}`}>
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Log in
        </Button>

        {demoEmail && demoPassword && (
          <Button variant="secondary" fullWidth disabled={isSubmitting} onClick={useDemo}>
            Try the demo account
          </Button>
        )}
      </form>
    </AuthLayout>
  );
}
