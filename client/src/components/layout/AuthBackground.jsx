function GoldRupeeCoin({ className = "" }) {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl transform scale-125 pointer-events-none" />
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full drop-shadow-[0_16px_36px_rgba(0,0,0,0.75)]"
      >
        <defs>
          <linearGradient id="gold-side-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="25%" stopColor="#D97706" />
            <stop offset="70%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
          <linearGradient id="gold-bezel" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <radialGradient id="gold-face" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="25%" stopColor="#FBBF24" />
            <stop offset="65%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </radialGradient>
          <filter id="gold-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#451A03" floodOpacity="0.8" />
          </filter>
        </defs>

        <g opacity="0.95">
          <path
            d="M 40,40 C 24,62 24,98 42,120 L 54,128 C 34,104 34,68 52,48 Z"
            fill="url(#gold-side-rim)"
          />
          <path d="M 33,52 L 45,58" stroke="#FDE68A" strokeWidth="1.2" opacity="0.85" />
          <path d="M 29,63 L 41,69" stroke="#FDE68A" strokeWidth="1.2" opacity="0.85" />
          <path d="M 27,74 L 39,79" stroke="#FDE68A" strokeWidth="1.2" opacity="0.85" />
          <path d="M 27,86 L 39,90" stroke="#FDE68A" strokeWidth="1.2" opacity="0.85" />
          <path d="M 29,98 L 41,102" stroke="#FDE68A" strokeWidth="1.2" opacity="0.85" />
          <path d="M 34,109 L 46,113" stroke="#FDE68A" strokeWidth="1.2" opacity="0.85" />
          <path d="M 42,118 L 54,122" stroke="#FDE68A" strokeWidth="1.2" opacity="0.85" />
        </g>

        <g transform="translate(6, 2)">
          <ellipse cx="86" cy="80" rx="48" ry="54" fill="url(#gold-bezel)" stroke="#FEF08A" strokeWidth="1.5" />
          <ellipse cx="86" cy="80" rx="42" ry="47" fill="url(#gold-face)" />
          <ellipse
            cx="86"
            cy="80"
            rx="36"
            ry="40"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="1.5"
            strokeDasharray="2.5 3"
            opacity="0.85"
          />
          <ellipse
            cx="86"
            cy="80"
            rx="32"
            ry="36"
            fill="none"
            stroke="#B45309"
            strokeWidth="1"
            opacity="0.6"
          />

          <text
            x="86"
            y="92"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="34"
            fontWeight="800"
            fill="#FFFBEB"
            filter="url(#gold-shadow)"
          >
            ₹
          </text>

          <path
            d="M 62,52 C 76,42 94,44 108,54 C 96,62 80,64 62,52 Z"
            fill="#FFFFFF"
            opacity="0.18"
          />
        </g>
      </svg>
    </div>
  );
}

function SilverRupeeCoin({ className = "" }) {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <div className="absolute inset-0 rounded-full bg-slate-300/15 blur-xl pointer-events-none" />
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
      >
        <defs>
          <linearGradient id="silver-rim-1" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#CBD5E1" />
            <stop offset="70%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <radialGradient id="silver-face-1" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#E2E8F0" />
            <stop offset="65%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>
          <filter id="silver-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#1E293B" floodOpacity="0.8" />
          </filter>
        </defs>

        <circle cx="60" cy="60" r="54" fill="url(#silver-rim-1)" stroke="#FFFFFF" strokeWidth="1.2" />
        <circle cx="60" cy="60" r="47" fill="url(#silver-face-1)" />
        <circle
          cx="60"
          cy="60"
          r="41"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeDasharray="2.5 2.5"
          opacity="0.8"
        />
        <circle cx="60" cy="60" r="37" fill="none" stroke="#475569" strokeWidth="0.8" opacity="0.5" />

        <text
          x="60"
          y="72"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="36"
          fontWeight="800"
          fill="#FFFFFF"
          filter="url(#silver-shadow)"
        >
          ₹
        </text>

        <path
          d="M 30,40 C 45,30 75,30 90,40 C 80,48 40,48 30,40 Z"
          fill="#FFFFFF"
          opacity="0.2"
        />
      </svg>
    </div>
  );
}

function SilverDollarCoin({ className = "" }) {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-2xl transform scale-125 pointer-events-none" />
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full drop-shadow-[0_16px_36px_rgba(0,0,0,0.7)]"
      >
        <defs>
          <linearGradient id="dollar-side-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#CBD5E1" />
            <stop offset="70%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="dollar-bezel" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#E2E8F0" />
            <stop offset="70%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <radialGradient id="dollar-face" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#E2E8F0" />
            <stop offset="70%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>
          <filter id="dollar-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.75" />
          </filter>
        </defs>

        <g opacity="0.92">
          <path
            d="M 120,40 C 136,62 136,98 118,120 L 106,128 C 126,104 126,68 108,48 Z"
            fill="url(#dollar-side-rim)"
          />
          <path d="M 127,52 L 115,58" stroke="#E2E8F0" strokeWidth="1.2" opacity="0.85" />
          <path d="M 131,63 L 119,69" stroke="#E2E8F0" strokeWidth="1.2" opacity="0.85" />
          <path d="M 133,74 L 121,79" stroke="#E2E8F0" strokeWidth="1.2" opacity="0.85" />
          <path d="M 133,86 L 121,90" stroke="#E2E8F0" strokeWidth="1.2" opacity="0.85" />
          <path d="M 131,98 L 119,102" stroke="#E2E8F0" strokeWidth="1.2" opacity="0.85" />
          <path d="M 127,109 L 115,113" stroke="#E2E8F0" strokeWidth="1.2" opacity="0.85" />
          <path d="M 120,118 L 108,122" stroke="#E2E8F0" strokeWidth="1.2" opacity="0.85" />
        </g>

        <g transform="translate(-6, 2)">
          <ellipse cx="74" cy="80" rx="48" ry="54" fill="url(#dollar-bezel)" stroke="#FFFFFF" strokeWidth="1.5" />
          <ellipse cx="74" cy="80" rx="42" ry="47" fill="url(#dollar-face)" />
          <ellipse
            cx="74"
            cy="80"
            rx="36"
            ry="40"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="2.5 3"
            opacity="0.8"
          />
          <ellipse
            cx="74"
            cy="80"
            rx="32"
            ry="36"
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            opacity="0.5"
          />

          <text
            x="74"
            y="93"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="38"
            fontWeight="800"
            fill="#FFFFFF"
            filter="url(#dollar-shadow)"
          >
            $
          </text>

          <path
            d="M 50,54 C 64,44 82,46 96,56 C 84,64 68,66 50,54 Z"
            fill="#FFFFFF"
            opacity="0.2"
          />
        </g>
      </svg>
    </div>
  );
}

function AirplaneGlyph({ className = "size-3.5", rotation = 0 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

export default function AuthBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#090d16]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#060911] via-[#090d16] to-[#0c1220]" />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] rounded-full bg-radial from-slate-800/20 via-transparent to-transparent blur-3xl" />

      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M -40,460 C 140,430 200,510 270,610 C 320,680 330,760 270,810 C 210,860 140,820 90,750 C 40,680 50,570 130,530"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1.4"
          strokeDasharray="4 6"
        />

        <path
          d="M 520,440 C 740,320 960,300 1140,340 C 1260,370 1360,340 1480,280"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1.4"
          strokeDasharray="4 6"
        />

        <path
          d="M 880,330 C 1040,240 1200,240 1380,290 C 1420,300 1460,320 1500,340"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />

        <g opacity="0.95">
          <polygon points="0,900 0,640 120,550 240,670 380,600 520,730 520,900" fill="#0c121e" />
          <polygon points="120,550 240,670 180,690" fill="#151e30" />
          <polygon points="380,600 520,730 450,760" fill="#151e30" />
          <line x1="120" y1="550" x2="180" y2="690" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="380" y1="600" x2="450" y2="760" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          <polygon points="380,900 380,730 620,660 820,720 1020,650 1100,760 1100,900" fill="#090e18" />

          <polygon points="960,900 1040,660 1160,510 1270,620 1360,490 1440,560 1440,900" fill="#0d1422" />
          <polygon points="1160,510 1270,620 1210,660" fill="#182338" />
          <polygon points="1360,490 1440,560 1390,630" fill="#182338" />
          <line x1="1160" y1="510" x2="1210" y2="660" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <line x1="1360" y1="490" x2="1390" y2="630" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        </g>
      </svg>

      <div className="absolute top-[52%] left-[7%] sm:left-[8%] text-slate-300">
        <AirplaneGlyph className="size-4" rotation={-40} />
      </div>

      <div className="absolute top-[34%] right-[22%] text-slate-300">
        <AirplaneGlyph className="size-4" rotation={35} />
      </div>

      <div className="absolute top-[33%] right-[5%] text-slate-300">
        <AirplaneGlyph className="size-4" rotation={45} />
      </div>

      <div className="absolute top-[22%] left-4 sm:left-10 lg:left-16 xl:left-24 w-28 sm:w-32 lg:w-36 transition-transform">
        <GoldRupeeCoin />
      </div>

      <div className="absolute top-[14%] right-6 sm:right-14 lg:right-24 xl:right-32 w-20 sm:w-22 lg:w-24">
        <SilverRupeeCoin />
      </div>

      <div className="absolute bottom-[18%] right-4 sm:right-10 lg:right-16 xl:right-28 w-28 sm:w-32 lg:w-36">
        <SilverDollarCoin />
      </div>

      <div className="absolute top-[48%] left-[8%] xl:left-[12%] hidden md:flex items-center gap-2 rounded-xl border border-slate-700/60 bg-[#0d1424]/85 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-md">
        <span className="text-sm">🌴</span>
        <span className="font-semibold tracking-wider text-[11px] text-slate-100 uppercase">BALI</span>
      </div>

      <div className="absolute top-[69%] left-[16%] xl:left-[20%] hidden md:flex items-center gap-2 rounded-xl border border-slate-700/60 bg-[#0d1424]/85 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-md">
        <span className="text-sm">🗼</span>
        <span className="font-semibold tracking-wider text-[11px] text-slate-100 uppercase">PARIS</span>
      </div>

      <div className="absolute top-[40%] right-[8%] xl:right-[12%] hidden md:flex items-center gap-2 rounded-xl border border-slate-700/60 bg-[#0d1424]/85 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-md">
        <span className="text-sm">📍</span>
        <span className="font-semibold tracking-wider text-[11px] text-slate-100 uppercase">TOKYO</span>
      </div>
    </div>
  );
}
