import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  PieChart,
  Receipt,
  RefreshCw,
  Share2,
  Sliders,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import Footer from "@/components/Footer";
import { APP_NAME } from "@/lib/constants";

const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;

export default function Landing() {
  const { user, status, login } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);

  const [calcAmount, setCalcAmount] = useState(3000);
  const [calcPeople, setCalcPeople] = useState(4);
  const [calcSplitType, setCalcSplitType] = useState("EQUAL");

  const [openFaq, setOpenFaq] = useState(null);

  const handleDemoLogin = async () => {
    if (!demoEmail || !demoPassword) {
      navigate("/login");
      return;
    }
    setDemoLoading(true);
    try {
      await login({ email: demoEmail, password: demoPassword });
      navigate("/dashboard");
    } catch {
      navigate("/login");
    } finally {
      setDemoLoading(false);
    }
  };

  const calcResults = useMemo(() => {
    const totalPaise = Math.round(calcAmount * 100);
    const count = Math.max(1, calcPeople);

    if (calcSplitType === "EQUAL") {
      const base = Math.floor(totalPaise / count);
      const remainder = totalPaise % count;
      return Array.from({ length: count }, (_, i) => ({
        name: `Friend ${i + 1}`,
        share: (base + (i < remainder ? 1 : 0)) / 100,
        pct: (100 / count).toFixed(1),
      }));
    }

    if (calcSplitType === "PERCENT") {

      const weights = [40, 30, 20, 10, 0, 0].slice(0, count);
      const sumWeight = weights.reduce((a, b) => a + b, 0) || 100;
      return Array.from({ length: count }, (_, i) => {
        const pct = Math.round((weights[i] / sumWeight) * 100);
        return {
          name: `Friend ${i + 1}`,
          share: ((totalPaise * pct) / 10000),
          pct: `${pct}%`,
        };
      });
    }

    const shares = [2, 1, 1, 1, 1, 1].slice(0, count);
    const totalShares = shares.reduce((a, b) => a + b, 0);
    return Array.from({ length: count }, (_, i) => ({
      name: `Friend ${i + 1}`,
      share: ((totalPaise * shares[i]) / totalShares / 100),
      pct: `${shares[i]} share`,
    }));
  }, [calcAmount, calcPeople, calcSplitType]);

  const faqs = [
    {
      q: "Kya mere doston ko koi app download karni padegi?",
      a: "Bilkul nahi! Splitly 100% web-first aur mobile-optimized hai. WhatsApp par invite link bhejo, link par click karte hi browser mein group khul jata hai.",
    },
    {
      q: "Smart Debt Simplification kaise kaam karta hai?",
      a: "Agar A ko B ko ₹500 dene hain, aur B ko C ko ₹500 dene hain, to Splitly circular transfers ko khatam karke direct 'A pays C ₹500' kar deta hai. 10 zigzag transfers sirf 2-3 direct payments mein settle ho jate hain.",
    },
    {
      q: "Kya Splitly 100% free hai?",
      a: "Haan, Splitly bilkul free aur open-source hai. Koi hidden charges, ads ya subscription nahi hai.",
    },
    {
      q: "Odd amounts par 1-2 paise ka roundoff issue aata hai kya?",
      a: "Kabhi nahi. Splitly backend mein saare calculations integer paise mein karta hai aur Largest Remainder algorithm use karta hai, jisse total hamesha 100% exact rehta hai.",
    },
    {
      q: "Kya hum expenses ka bill ya receipt attach kar sakte hain?",
      a: "Haan, restaurant receipts, hotel bills ya tickets ki photo expense banate waqt direct upload kar sakte ho taaki baad mein koi confusion na rahe.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 font-sans antialiased">

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-sm transition group-hover:scale-105">
              <Wallet className="size-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                {APP_NAME}
                <span className="text-indigo-600">.</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600 -mt-1">
                Split Smart
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#features" className="transition hover:text-indigo-600">
              Features
            </a>
            <a href="#simplifier" className="transition hover:text-indigo-600">
              Debt Simplifier
            </a>
            <a href="#calculator" className="transition hover:text-indigo-600">
              Live Calculator
            </a>
            <a href="#faq" className="transition hover:text-indigo-600">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {status === "authenticated" && user ? (
              <Link
                to="/dashboard"
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:text-sm"
              >
                <span>Dashboard ({user.name.split(" ")[0]})</span>
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex h-9 items-center rounded-xl px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-sm"
                >
                  Log in
                </Link>
                {demoEmail && (
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={demoLoading}
                    className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/70 px-3.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100/80"
                  >
                    <Sparkles className="size-3.5" />
                    <span>{demoLoading ? "Logging in…" : "Demo"}</span>
                  </button>
                )}
                <Link
                  to="/register"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:text-sm"
                >
                  <span>Sign up</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">

        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200/50 via-emerald-100/40 to-transparent blur-3xl opacity-70" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Smart Debt Simplification 2.0</span>
              <span className="text-indigo-400">·</span>
              <span className="text-slate-600">Zero Math Confusion</span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.12]">
              Split expenses with friends,{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                not friendships.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Goa trip ho, flat ka rent ya weekend dinner — sabhi kharche secondon mein baanto.
              Splitly circular payments ko automatically collapse karke sabse kam transfers mein
              settle kar deta hai.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                <span>Start Splitting — Free</span>
                <ArrowRight className="size-4" />
              </Link>
              {demoEmail && (
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={demoLoading}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-xs transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Sparkles className="size-4 text-emerald-600" />
                  <span>{demoLoading ? "Loading Demo…" : "Try Live Demo Account"}</span>
                </button>
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                100% Free & Open Source
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Instant WhatsApp Invites
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Zero Math & Roundoff Errors
              </span>
            </div>
          </div>

          <div
            id="simplifier"
            className="mt-14 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50"
          >

            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-3 rounded-full bg-rose-400" />
                <span className="flex size-3 rounded-full bg-amber-400" />
                <span className="flex size-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-xs font-semibold text-slate-600">
                  group/goa-weekend-trip
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-800">
                <Zap className="size-3.5 text-emerald-600" />
                Algorithm: 7 Transfers Reduced to 2
              </div>
            </div>

            <div className="grid divide-y md:divide-y-0 md:divide-x divide-slate-100 md:grid-cols-2">

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    Traditional Way (Confusing)
                  </span>
                  <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                    7 Zigzag Payments
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-slate-800">
                  Multiple circular payments & disputes
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Sabne alag-alag kharche kiye, aur sab ek doosre ko paise bhejte reh gaye.
                </p>

                <div className="mt-5 space-y-2 font-mono text-xs text-slate-600">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                    <span>Rahul ➔ Aman (Hotel share)</span>
                    <span className="font-semibold text-slate-700">₹850</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                    <span>Aman ➔ Priya (Dinner bill)</span>
                    <span className="font-semibold text-slate-700">₹600</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                    <span>Priya ➔ Bablu (Cab fare)</span>
                    <span className="font-semibold text-slate-700">₹1,100</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                    <span>Rahul ➔ Bablu (Fuel)</span>
                    <span className="font-semibold text-slate-700">₹400</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 opacity-60">
                    <span>+ 3 more confusing pending transfers…</span>
                    <span className="font-semibold text-rose-600">Messy</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50/40 via-white to-emerald-50/40 p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    With Splitly (Smart Simplification)
                  </span>
                  <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    Just 2 Transfers!
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  Optimal settlement in minimal steps
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Splitly net balances ko calculate karke direct payment routes bana deta hai.
                </p>

                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-white p-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                        1
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Rahul ➔ Bablu Kumar
                        </p>
                        <p className="text-[11px] text-slate-500">Full settlement cleared</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">₹400.00</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-white p-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                        2
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Priya Singh ➔ Bablu Kumar
                        </p>
                        <p className="text-[11px] text-slate-500">Full settlement cleared</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">₹1,300.00</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50 p-2.5 text-xs text-slate-600">
                    <span className="font-medium">Aman Verma: ₹0.00</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <Check className="size-3.5 text-emerald-600" /> Already Settled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="calculator" className="py-16 bg-white border-y border-slate-200/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Interactive Tool
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Live Split Calculator
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Check karo kaise Splitly kisi bhi amount ko 1 paise ke roundoff error ke bina baant
              deta hai.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-center">

            <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 sm:p-8 lg:col-span-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Sliders className="size-4 text-indigo-600" />
                <span>Adjust Bill Details</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Total Bill Amount:{" "}
                  <span className="text-indigo-600 font-bold">₹{calcAmount.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="100"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>₹500</span>
                  <span>₹7,500</span>
                  <span>₹15,000</span>
                </div>
              </div>

              <div className="mt-5 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Number of Friends:{" "}
                  <span className="text-emerald-600 font-bold">{calcPeople} people</span>
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCalcPeople(num)}
                      className={`flex-1 h-9 rounded-xl text-xs font-semibold transition ${
                        calcPeople === num
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Split Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "EQUAL", label: "Equally" },
                    { id: "PERCENT", label: "Percent" },
                    { id: "SHARES", label: "Shares" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCalcSplitType(m.id)}
                      className={`h-9 rounded-xl text-xs font-semibold transition ${
                        calcSplitType === m.id
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-7 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">
                    Split Breakdown
                  </span>
                  <p className="text-lg font-bold text-slate-900">
                    Total: ₹{calcAmount.toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
                  Exact Paise Precision
                </span>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {calcResults.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                        <p className="text-xs text-slate-400">{r.pct}</p>
                      </div>
                    </div>
                    <span className="text-base font-bold text-slate-900">
                      ₹{r.share.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600">
                <span>Total Calculated Sum:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{calcResults.reduce((acc, curr) => acc + curr.share, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Why Splitly?
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Har tarah ke group ke liye ready
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Chahe flatmates ka monthly ration ho, doston ka dinner bill ya Himalayan road trip.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <RefreshCw className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Smart Debt Simplifier
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Circular debts ko condense karke minimum payments banata hai. Log aapas mein 8
                baar nahi, sirf 2 baar transfer karte hain.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Sliders className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                4 Flexible Split Modes
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Equal (barabar), Exact (bill item wise), Percentage (income-based), aur Shares (room
                size ke mutabiq) splits support karta hai.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Share2 className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                1-Click WhatsApp Invite
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Kisi ko app download karne ki zaroorat nahi. Secure invite link share karo aur
                friends sidha browser se join kar lenge.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <PieChart className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Analytics & Top Spender
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Category wise pie-charts: Food, Travel, Rent aur Stay par kitna kharch hua, aur sabse
                zyada kisne pay kiya.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Receipt className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Receipts & Bill Upload
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Expense banate waqt restaurant ya hotel bill ki image attach karo taaki har member
                bill transparently verify kar sake.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Export to CSV & PDF
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Trip ya month khatam hone par saara expense breakdown ek click mein clean CSV ya
                PDF report format mein download karo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Simple Workflow
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Settle in 3 Simple Steps
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div className="relative rounded-2xl border border-slate-200 bg-[#f8fafc] p-7 shadow-xs">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-xs">
                1
              </span>
              <h3 className="mt-5 text-base font-bold text-slate-900">Create a Group</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Group ka naam rakho (jaise "Manali Trek" ya "Flat 302") aur invite code doston ko
                WhatsApp par share karo.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-200 bg-[#f8fafc] p-7 shadow-xs">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-xs">
                2
              </span>
              <h3 className="mt-5 text-base font-bold text-slate-900">Add Bills on the Go</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Jab bhi kharcha ho, amount daalo, payer select karo aur choose karo ki kiske hisse
                kitna kharcha aayega.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-200 bg-[#f8fafc] p-7 shadow-xs">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-xs">
                3
              </span>
              <h3 className="mt-5 text-base font-bold text-slate-900">One-Tap Settlement</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Trip ke end par Splitly bata deta hai kisko kisko kitna UPI transfer karna hai. Ek
                click mein debts clear!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-[#f8fafc]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Got Questions?
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:text-indigo-600"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight
                      className={`size-4 text-slate-400 transition-transform ${
                        isOpen ? "rotate-90 text-indigo-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 pt-3 pb-5 text-xs leading-relaxed text-slate-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-emerald-600 p-8 sm:p-14 text-center text-white shadow-xl shadow-indigo-100">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Ready to split smart on your next trip?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-indigo-100 max-w-xl mx-auto">
              Join thousands of friends, roommates, and travelers who never fight over bills.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-7 text-sm font-bold text-indigo-900 shadow-md transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <span>Create an Account — Free</span>
                <ArrowRight className="size-4" />
              </Link>
              {demoEmail && (
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={demoLoading}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Sparkles className="size-4" />
                  <span>Try Demo Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
