import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Globe,
  Heart,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
import { toast } from "sonner";
import { APP_NAME } from "@/lib/constants";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubscribed(true);
    toast.success("Thank you for subscribing to SplitMate release updates!");
    setEmail("");
  };

  return (
    <footer className="border-t border-slate-200/90 bg-white text-slate-600 transition-colors">

      <div className="border-b border-slate-100 bg-slate-50/60 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">

            <div className="lg:col-span-7">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-xs">
                  <Wallet className="size-4.5" />
                </span>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  {APP_NAME}
                  <span className="text-indigo-600">.</span>
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  v2.0 Clean Slate
                </span>
              </div>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                Split expenses with friends, not friendships. The open-source group expense manager
                that collapses circular debts into minimal transfers using mathematical graph
                simplification.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-slate-700 font-semibold">All Systems Operational</span>
                <span className="text-slate-300">·</span>
                <span>Render Free Tier + MongoDB Atlas Cluster</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-indigo-600" />
                <span>Stay Updated</span>
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Get notified when new split algorithms, receipt OCR, or mobile features drop.
              </p>

              {subscribed ? (
                <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>You're subscribed! No spam, ever.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-3.5 flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      required
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
                  >
                    <span>Join</span>
                    <Send className="size-3" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Product
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs">
                <li>
                  <a href="#simplifier" className="transition hover:text-indigo-600">
                    Debt Minimizer Engine
                  </a>
                </li>
                <li>
                  <a href="#calculator" className="transition hover:text-indigo-600">
                    Live Split Calculator
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition hover:text-indigo-600">
                    Equal & Exact Splits
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition hover:text-indigo-600">
                    Percentage & Shares
                  </a>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <span>Receipt Bill Upload</span>
                    <span className="rounded bg-indigo-50 px-1 py-0.2 text-[10px] font-bold text-indigo-600">
                      Pro
                    </span>
                  </span>
                </li>
                <li>
                  <span className="text-slate-400">CSV & PDF Reports</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Use Cases
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs">
                <li>
                  <a href="#features" className="transition hover:text-indigo-600">
                    Goa & Vacation Trips
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition hover:text-indigo-600">
                    Flatmates & Room Rent
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition hover:text-indigo-600">
                    Dinner Bills & Parties
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition hover:text-indigo-600">
                    Couples & Household
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition hover:text-indigo-600">
                    College Project Groups
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition hover:text-indigo-600">
                    Office Team Lunches
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Account & App
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs">
                <li>
                  <Link to="/dashboard" className="transition hover:text-indigo-600">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="transition hover:text-indigo-600">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="transition hover:text-indigo-600">
                    Create New Account
                  </Link>
                </li>
                <li>
                  <Link to="/forgot-password" className="transition hover:text-indigo-600">
                    Reset Password
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Stack & Docs
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs">
                <li>
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    React 18 + Vite
                  </span>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <span className="size-1.5 rounded-full bg-indigo-500" />
                    Tailwind CSS v4
                  </span>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Node.js & MongoDB
                  </span>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <span className="size-1.5 rounded-full bg-cyan-500" />
                    Web Locks & Sync
                  </span>
                </li>
                <li>
                  <a
                    href="http://localhost:5000/api/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600"
                  >
                    <span>Swagger API Docs</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Trust & Security
              </h3>
              <div className="mt-4 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>Integer Math Guarantee</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Every split calculation is stored in discrete paise units with zero rounding error.
                </p>
                <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                  <Lock className="size-3 text-slate-400" />
                  <span>Zero-Tracker Architecture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/80 bg-slate-50/50 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} {APP_NAME}. Designed & Built by <a href="https://github.com/bablukumar05" target="_blank" rel="noreferrer" className="font-semibold text-slate-800 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-600 transition">Bablu Kumar</a>.</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              Made with <Heart className="size-3 fill-rose-500 text-rose-500" /> by Bablu Kumar for hassle-free trips & flats.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs">
              <Globe className="size-3 text-slate-400" />
              <span>India · INR (₹)</span>
            </span>

            <div className="flex items-center gap-1.5 text-slate-400">
              <a
                href="https://github.com/bablukumar05"
                target="_blank"
                rel="noreferrer"
                aria-label="Bablu Kumar on GitHub"
                className="rounded-lg p-1.5 transition hover:bg-slate-200/60 hover:text-slate-800"
              >
                <GithubIcon className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
