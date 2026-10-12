import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import MobileTopBar from "./MobileTopBar";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const { pathname } = useLocation();

  // /groups/<id>/members aur /groups/<id>/balances ek hi "page" hain: tab badalne par scroll na ho
  const page = pathname.split("/").slice(0, 3).join("/");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="min-h-dvh">
      {/* Keyboard users ke liye: Tab dabate hi dikhta hai, navigation chhodke seedha content par */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <Sidebar />

      <div className="md:pl-64">
        <MobileTopBar />
        <main
          id="main"
          tabIndex={-1}
          className="nav-clearance mx-auto w-full max-w-5xl px-4 pt-5 outline-none sm:px-6 md:pb-10 md:pt-8"
        >
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
