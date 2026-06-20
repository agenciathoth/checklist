"use client";

import { SearchParamsProvider } from "@/contexts/SearchParamsProvider";
import { SessionProvider } from "next-auth/react";
import { ReactNode, Suspense } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <Suspense>
        <SearchParamsProvider>{children}</SearchParamsProvider>
      </Suspense>
    </SessionProvider>
  );
}
