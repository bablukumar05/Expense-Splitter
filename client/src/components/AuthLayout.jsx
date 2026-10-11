import { Wallet } from "lucide-react";
import Card from "@/components/ui/Card";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
          <Wallet className="size-7 text-white" />
        </span>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      <Card className="sm:p-6">{children}</Card>
      {footer && <p className="mt-5 text-center text-sm text-muted">{footer}</p>}
    </main>
  );
}
