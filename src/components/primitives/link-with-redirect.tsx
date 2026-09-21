"use client";

/*
 * This component redirects back to the same page after a successful action.
 * It's used to redirect the user back to the page they were on after they sign in.
 */

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useMemo } from "react";
import { SEARCH_PARAM_KEYS } from "@/config/search-param-keys";

export type LinkWithRedirectProps = LinkProps & {
  redirectTo?: string;
  children?: ReactNode;
  className?: string;
};

export const LinkWithRedirect = ({
  children,
  href,
  redirectTo,
  ...props
}: LinkWithRedirectProps) => {
  const pathname = usePathname();
  // Reassigning the prop itself hides where the value came from, and React's
  // compiler treats props as frozen.
  const resolvedRedirectTo = redirectTo || pathname;

  // Create a new URL object with the redirectTo path
  const nextUrl = useMemo(() => {
    if (resolvedRedirectTo && typeof window !== "undefined") {
      return new URL(resolvedRedirectTo, window.location.origin);
    }
    return undefined;
  }, [resolvedRedirectTo]);

  const params = new URLSearchParams();
  params.set(SEARCH_PARAM_KEYS.nextUrl, String(nextUrl));

  return (
    <Link {...props} href={`${typeof href === "string" ? href : href.href}?${String(params)}`}>
      {children}
    </Link>
  );
};
