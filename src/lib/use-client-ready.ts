"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function useClientReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
