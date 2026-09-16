import * as React from "react";

// Nothing ever changes after hydration, so there is nothing to subscribe to.
const subscribe = () => () => {
  /* no-op */
};

/**
 * True once the component has hydrated on the client, false during SSR and the
 * first render. useSyncExternalStore gives the same answer without a state
 * update in an effect, so there is no extra render pass.
 */
export function useMounted() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
