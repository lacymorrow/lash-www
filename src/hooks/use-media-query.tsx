import * as React from "react";

/**
 * Reads a media query through useSyncExternalStore rather than mirroring it
 * into state from an effect. That keeps the first client render correct instead
 * of flashing the fallback value.
 */
export function useMediaQuery(query: string) {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const result = matchMedia(query);
      result.addEventListener("change", onStoreChange);
      return () => result.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  return React.useSyncExternalStore(
    subscribe,
    () => matchMedia(query).matches,
    () => false
  );
}
