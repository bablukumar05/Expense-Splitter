import { Home, TrendingUp, UserRound } from "lucide-react";

export const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Home",
    icon: Home,
    isActive: (pathname) => pathname === "/dashboard" || pathname === "/" || pathname.startsWith("/groups"),
  },
  {
    to: "/insights",
    label: "Insights",
    icon: TrendingUp,
    isActive: (pathname) => pathname.startsWith("/insights"),
  },
  {
    to: "/account",
    label: "Account",
    icon: UserRound,
    isActive: (pathname) => pathname.startsWith("/account"),
  },
];
