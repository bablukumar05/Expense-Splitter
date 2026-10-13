import { useId } from "react";
import { cn } from "@/lib/cn";

export default function FrostedCoin({ size = 80, tilt = { x: 22, y: -16, z: 14 }, className = "" }) {
  const uid = useId().replace(/:/g, "");
  const transform = `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotateZ(${tilt.z}deg)`;

  return (
    <div
      className={cn("pointer-events-none select-none transition-transform duration-700", className)}
      style={{ transform, width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="size-full filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`coinRim-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#94a3b8" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#334155" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id={`coinFace-${uid}`} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.38" />
            <stop offset="35%" stopColor="#94a3b8" stopOpacity="0.18" />
            <stop offset="70%" stopColor="#334155" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.45" />
          </linearGradient>

          <linearGradient id={`symbolGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.95" />
          </linearGradient>

          <radialGradient id={`glowGrad-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="47" stroke={`url(#coinRim-${uid})`} strokeWidth="3" />
        <circle cx="50" cy="50" r="45.5" fill={`url(#coinFace-${uid})`} />
        <circle cx="50" cy="50" r="45.5" fill={`url(#glowGrad-${uid})`} />

        <circle
          cx="50"
          cy="50"
          r="39"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />

        <path
          d="M 18 36 A 42 42 0 0 1 82 24 A 45 45 0 0 0 18 36 Z"
          fill="white"
          fillOpacity="0.32"
        />

        <g transform="translate(27, 25) scale(1.95)">
          <path
            d="M6 3h12"
            stroke={`url(#symbolGrad-${uid})`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M6 8h12"
            stroke={`url(#symbolGrad-${uid})`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="m6 13 8.5 8"
            stroke={`url(#symbolGrad-${uid})`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M6 13h3"
            stroke={`url(#symbolGrad-${uid})`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M9 13c6.667 0 6.667-10 0-10"
            stroke={`url(#symbolGrad-${uid})`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
