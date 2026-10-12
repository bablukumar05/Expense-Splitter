import { Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/features/auth/useAuth";
import { APP_NAME } from "@/lib/constants";

export default function MobileTopBar() {
  const { user } = useAuth();

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-gradient">
            <Wallet className="size-4 text-white" />
          </span>
          <span className="font-bold">{APP_NAME}</span>
        </Link>
        <Link to="/account" aria-label="Account" className="rounded-full">
          <Avatar name={user?.name} src={user?.avatar} size="sm" />
        </Link>
      </div>
    </header>
  );
}
