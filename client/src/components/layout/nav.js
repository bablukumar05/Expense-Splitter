import { Home, UserRound } from "lucide-react";

export const NAV_ITEMS = [
  {
    to: "/",
    label: "Home",
    icon: Home,
    isActive: (pathname) => pathname === "/" || pathname.startsWith("/groups"),
  },
  {
    to: "/account",
    label: "Account",
    icon: UserRound,
    isActive: (pathname) => pathname.startsWith("/account"),
  },
];
