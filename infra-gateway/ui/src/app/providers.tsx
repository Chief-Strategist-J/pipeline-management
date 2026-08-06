"use client";

import React, { useRef } from "react";
import { Provider } from "react-redux";
import { configureAppStore, type AppStore } from "@/core/store/configure-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = configureAppStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
