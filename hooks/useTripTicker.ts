"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function useTripTicker() {
  const tickProgress = useAppStore((s) => s.tickProgress);
  useEffect(() => {
    const id = setInterval(() => {
      tickProgress();
    }, 1000);
    return () => clearInterval(id);
  }, [tickProgress]);
}
