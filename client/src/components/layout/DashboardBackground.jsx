import FrostedCoin from "./FrostedCoin";

export default function DashboardBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-[#070b14]" />

      <div className="absolute top-[15%] -left-24 size-[520px] rounded-full bg-emerald-500/28 blur-[120px]" />
      <div className="absolute top-[4%] right-[8%] size-[480px] rounded-full bg-cyan-400/25 blur-[130px]" />
      <div className="absolute bottom-[2%] right-[2%] size-[520px] rounded-full bg-emerald-500/25 blur-[120px]" />
      <div className="absolute -bottom-24 left-[22%] size-[460px] rounded-full bg-teal-500/22 blur-[120px]" />

      <svg
        className="absolute inset-x-0 top-0 h-96 w-full"
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 500 280 C 660 190, 820 110, 1020 40"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="2"
          strokeDasharray="6 8"
        />
        <g transform="translate(740, 150) rotate(-32) scale(1.2)">
          <path
            d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
            fill="rgba(255, 255, 255, 0.35)"
          />
        </g>
      </svg>

      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="chartLineGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="30%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
          </linearGradient>
          <filter id="chartGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M -50 680 Q 150 720, 280 620 T 600 520 T 920 380 T 1180 240 T 1480 140"
          stroke="url(#chartLineGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#chartGlowFilter)"
        />

        <circle cx="600" cy="520" r="5" fill="#10b981" />
        <circle cx="600" cy="520" r="11" stroke="#10b981" strokeWidth="1.5" opacity="0.45" />
        <circle cx="920" cy="380" r="6" fill="#06b6d4" />
        <circle cx="920" cy="380" r="13" stroke="#06b6d4" strokeWidth="1.5" opacity="0.55" />
        <circle cx="1180" cy="240" r="6" fill="#10b981" />
        <circle cx="1180" cy="240" r="15" stroke="#10b981" strokeWidth="1.5" opacity="0.65" />
      </svg>

      <FrostedCoin
        size={80}
        tilt={{ x: 22, y: -16, z: 18 }}
        className="absolute top-16 right-[26%] animate-float-slow"
      />

      <FrostedCoin
        size={88}
        tilt={{ x: 28, y: -22, z: 25 }}
        className="absolute top-44 right-[2%] animate-float-reverse"
      />

      <FrostedCoin
        size={94}
        tilt={{ x: 18, y: -10, z: 8 }}
        className="absolute top-[380px] left-[50%] -translate-x-1/2 animate-float-slow"
      />

      <FrostedCoin
        size={98}
        tilt={{ x: 14, y: -8, z: 12 }}
        className="absolute bottom-6 left-[34%] animate-float-reverse"
      />

      <FrostedCoin
        size={72}
        tilt={{ x: 20, y: -14, z: 15 }}
        className="absolute bottom-16 right-[16%] opacity-75 animate-float-slow"
      />
    </div>
  );
}
