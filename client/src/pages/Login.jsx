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

const demoEmail = import.meta.env.VITE_DEMO_EMAIL || "asha.demo@example.com";
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || "DemoPass123";

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
      subtitle="Log in to manage your group trips"
      badge="SPLITLY • TRAVEL & EXPENSES"
      footer={
        <p className="text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            state={location.state}
            className="text-sky-400 font-semibold hover:text-sky-300 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormAlert>{formError}</FormAlert>

        <div className="space-y-1.5">
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Email Address"
            aria-label="Email Address"
            icon={Mail}
            error={errors.email?.message}
            className="h-11 sm:h-12 rounded-xl bg-[#101726]/90 border-slate-700/70 text-white placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            {...register("email")}
          />
        </div>

        <div className="space-y-1.5">
          <PasswordInput
            autoComplete="current-password"
            placeholder="Password"
            aria-label="Password"
            error={errors.password?.message}
            className="h-11 sm:h-12 rounded-xl bg-[#101726]/90 border-slate-700/70 text-white placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            {...register("password")}
          />
          <div className="text-right pt-0.5">
            <Link
              to="/forgot-password"
              className="text-xs text-sky-400 hover:text-sky-300 font-medium transition"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <div className="pt-1 space-y-2.5">
          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            className="h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:from-[#0369a1] hover:via-[#0284c7] hover:to-[#0ea5e9] text-white shadow-[0_4px_24px_rgba(14,165,233,0.45)] hover:shadow-[0_4px_28px_rgba(14,165,233,0.6)] font-semibold transition"
          >
            Log In
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={isSubmitting}
            onClick={useDemo}
            className="h-11 rounded-xl sm:rounded-2xl border border-slate-700/70 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 font-medium transition"
          >
            Try Demo Dashboard
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
