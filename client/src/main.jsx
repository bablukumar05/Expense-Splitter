import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";
import "@fontsource-variable/inter";
import "./index.css";
import App from "./App.jsx";
import { wakeServer } from "@/api/client";
import ErrorBoundary from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/queryClient";

window.addEventListener("vite:preloadError", () => {
  try {
    const last = Number(sessionStorage.getItem("splitmate.chunkReload") || 0);
    if (Date.now() - last > 10_000) {
      sessionStorage.setItem("splitmate.chunkReload", String(Date.now()));
      window.location.reload();
    }
  } catch {
  }
});

wakeServer();

if (import.meta.env.PROD) {
  const updateSW = registerSW({
    onNeedRefresh() {
      toast("A new version is available", {
        id: "pwa-update",
        duration: Infinity,
        action: { label: "Update", onClick: () => updateSW(true) },
      });
    },
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
