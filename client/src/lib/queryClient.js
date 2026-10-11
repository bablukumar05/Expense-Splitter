import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Axios layer GET requests ko pehle hi retry karta hai, yahan dobara retry se wait kai guna ho jata
      retry: false,
    },
  },
});
