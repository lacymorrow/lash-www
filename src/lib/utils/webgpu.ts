import * as React from "react";

declare global {
  interface Navigator {
    gpu?: {
      requestAdapter?: () => Promise<any>;
    };
  }
}

export function isWebGPUAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.navigator?.gpu?.requestAdapter;
}

// Capability detection never changes after load, so there is nothing to
// subscribe to. useSyncExternalStore still gives the right answer on the client
// and false on the server, without a state update in an effect.
const subscribe = () => () => {
  /* no-op */
};

export function useWebGPUAvailability(): boolean {
  return React.useSyncExternalStore(subscribe, isWebGPUAvailable, () => false);
}
