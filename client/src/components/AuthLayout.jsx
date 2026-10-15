import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AuthBackground from "@/components/layout/AuthBackground";

function GlowingWalletIcon({ className = "size-14" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <linearGradient id="wallet-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="55%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
        <filter id="wallet-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect
        x="10"
        y="17"
        width="44"
        height="34"
        rx="8"
        stroke="url(#wallet-accent)"
        strokeWidth="2.5"
        filter="url(#wallet-glow)"
        fill="rgba(14, 25, 44, 0.4)"
      />
      <path
        d="M 10 26 C 22 24 42 24 54 26"
        stroke="url(#wallet-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M 32 27 L 37.5 30 V 35.5 C 37.5 39.5 35 42 32 44 C 29 42 26.5 39.5 26.5 35.5 V 30 Z"
        stroke="url(#wallet-accent)"
        strokeWidth="2.2"
        fill="rgba(56, 189, 248, 0.18)"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="34" r="2.2" fill="#FBBF24" filter="url(#wallet-glow)" />
      <path
        d="M 48 9 Q 48 13 52 13 Q 48 13 48 17 Q 48 13 44 13 Q 48 13 48 9 Z"
        fill="#FDE68A"
        opacity="0.95"
      />
      <path
        d="M 55 19 Q 55 21 57 21 Q 55 21 55 23 Q 55 21 53 21 Q 55 21 55 19 Z"
        fill="#38BDF8"
        opacity="0.85"
      />
    </svg>
  );
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  badge = "SPLITMATE • TRAVEL & EXPENSES",
  showBackButton = true,
  backTo = "/",
  backLabel = "Back to Home",
}) {
  return (
    <div className="relative min-h-dvh w-full flex items-center justify-center overflow-x-hidden px-4 py-10 sm:py-14">
      <AuthBackground />

      {showBackButton && (
        <Link
          to={backTo}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/90 backdrop-blur-md transition shadow-lg group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>{backLabel}</span>
        </Link>
      )}

      <main className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="relative w-full">
          <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-400/18 blur-3xl" />

          {badge && (
            <div className="flex justify-center -mb-3.5 relative z-20">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-[#0d1424]/95 px-4 py-1 text-[11px] font-semibold tracking-[0.16em] text-slate-200 uppercase shadow-[0_0_15px_rgba(56,189,248,0.2)] backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {badge}
              </div>
            </div>
          )}

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1322]/85 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(34,211,238,0.12),0_0_60px_rgba(245,158,11,0.1),0_24px_60px_-12px_rgba(0,0,0,0.85)]">
            <div className="pointer-events-none absolute -top-px left-8 right-8 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-400 opacity-90 blur-[0.5px]" />
            <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-sky-500/15 blur-2xl" />

            <div className="mb-6 flex flex-col items-center text-center">
              <div className="relative inline-flex items-center justify-center p-1 drop-shadow-[0_4px_16px_rgba(56,189,248,0.35)]">
                <GlowingWalletIcon className="size-14" />
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
            </div>

            {children}

            {footer && <div className="mt-5 text-center text-sm text-slate-400">{footer}</div>}
          </div>

          <footer className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-3">
            <span>© 2026 SplitMate</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer transition">Legal</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer transition">Privacy</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer transition">Help</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
