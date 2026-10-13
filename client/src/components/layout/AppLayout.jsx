import { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import PageFallback from "@/components/PageFallback";
import RouteAnnouncer from "@/components/RouteAnnouncer";
import BottomNav from "./BottomNav";
import DashboardBackground from "./DashboardBackground";
import MobileTopBar from "./MobileTopBar";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const { pathname } = useLocation();

  const tabMatch = pathname.match(
    /^\/groups\/[^/]+\/(expenses|balances|insights|recurring|members|activity)\/?$/
  );
  const page = tabMatch ? pathname.split("/").slice(0, 3).join("/") : pathname;
  const previousPage = useRef(page);

  useEffect(() => {
    if (previousPage.current === page) return;
    previousPage.current = page;
    window.scrollTo(0, 0);
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [page]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#070b14] text-ink">
      <DashboardBackground />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <RouteAnnouncer />
      <Sidebar />
      <div className="md:pl-64">
        <MobileTopBar />
        <main
          id="main"
          tabIndex={-1}
          className="nav-clearance relative z-10 mx-auto w-full max-w-5xl px-4 pt-5 outline-none sm:px-6 md:pb-10 md:pt-8"
        >
          <ErrorBoundary inline resetKey={page}>
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
