"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryClientContext({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create QueryClient only once using useState
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 2 minutes (Realtime handles instant updates)
            staleTime: 2 * 60 * 1000,
            // Keep unused data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests once
            retry: 1,
            // Refetch on window focus as fallback for Realtime
            refetchOnWindowFocus: true,
            // Refetch on reconnect as fallback for Realtime
            refetchOnReconnect: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
